import { useState } from "react";
import { MAINTENANCE_STRATEGIES, EQUIPMENT_LIST, criticalityColor, statusColor } from "../data/mockData";
import { CheckCircle, Clock, Users, TrendingUp, Filter } from "lucide-react";

const TASK_TYPES = ["Todos", "CBM", "TBM", "RTF", "FTM"];

const taskTypeColor = (type: string) => {
  switch (type) {
    case "CBM": return "bg-blue-100 text-blue-800 border-blue-200";
    case "TBM": return "bg-purple-100 text-purple-800 border-purple-200";
    case "RTF": return "bg-gray-100 text-gray-700 border-gray-200";
    case "FTM": return "bg-amber-100 text-amber-800 border-amber-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const rcmDecisionTree = [
  { step: "1", question: "¿Es evidente la falla para el operador en condiciones normales?", options: ["Sí → Visible", "No → Oculta"] },
  { step: "2", question: "¿Afecta la seguridad o el medio ambiente?", options: ["Sí → Tarea de seguridad mandatoria", "No → Continuar análisis"] },
  { step: "3", question: "¿Tiene consecuencia operacional?", options: ["Sí → CBM o TBM", "No → RTF o FTM"] },
  { step: "4", question: "¿Es detectable antes de la falla (condición P-F)?", options: ["Sí → CBM (Monitoreo)", "No → TBM (Preventivo fijo)"] },
];

export function Strategy() {
  const [filterType, setFilterType] = useState("Todos");
  const [filterEq, setFilterEq] = useState("Todos");
  const [activeTab, setActiveTab] = useState<"tasks" | "decision">("tasks");

  const equipments = ["Todos", ...new Set(MAINTENANCE_STRATEGIES.map(s => s.equipment_tag))];
  const filtered = MAINTENANCE_STRATEGIES.filter(s => {
    const matchType = filterType === "Todos" || s.task_type === filterType;
    const matchEq = filterEq === "Todos" || s.equipment_tag === filterEq;
    return matchType && matchEq;
  });

  const totalHours = filtered.reduce((a, b) => a + b.duration_h, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📋 Estrategia de Mantenimiento</h1>
        <p className="text-sm text-gray-500">RCM Process · 5 Fases · Metodología VSC / GFSN</p>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Proceso RCM — 5 Fases</h3>
        <div className="flex items-center gap-0 overflow-x-auto">
          {[
            { phase: "01", title: "Contexto Operacional", desc: "Función del activo", color: "bg-[#1B5E20]" },
            { phase: "02", title: "Criticidad", desc: "Análisis 6 factores", color: "bg-[#2E7D32]" },
            { phase: "03", title: "FMEA/FMECA", desc: "Modos de fallo", color: "bg-[#388E3C]" },
            { phase: "04", title: "Árbol de Decisión", desc: "Tipo de tarea", color: "bg-[#43A047]" },
            { phase: "05", title: "Plan de Mantenimiento", desc: "Paquetes de trabajo", color: "bg-[#4CAF50]" },
          ].map((phase, i) => (
            <div key={phase.phase} className="flex items-center flex-1 min-w-0">
              <div className={`flex-1 rounded-lg p-3 text-white text-center ${phase.color}`}>
                <p className="text-lg font-bold">{phase.phase}</p>
                <p className="text-xs font-semibold">{phase.title}</p>
                <p className="text-xs opacity-80">{phase.desc}</p>
              </div>
              {i < 4 && <div className="w-4 h-0.5 bg-gray-300 flex-shrink-0 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-5 flex gap-4">
          {(["tasks", "decision"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? "border-[#2E7D32] text-[#2E7D32]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "tasks" ? "📋 Tareas de Mantenimiento" : "🌳 Árbol de Decisión RCM"}
            </button>
          ))}
        </div>

        {activeTab === "tasks" && (
          <div className="p-5 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-1.5">
                {TASK_TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === t ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600"}`}>{t}</button>
                ))}
              </div>
              <select value={filterEq} onChange={e => setFilterEq(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                {equipments.map(eq => <option key={eq}>{eq}</option>)}
              </select>
              <div className="ml-auto text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                {filtered.length} tareas · {totalHours}h/ciclo
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tareas CBM", value: filtered.filter(t => t.task_type === "CBM").length, color: "bg-blue-50 text-blue-700" },
                { label: "Tareas TBM", value: filtered.filter(t => t.task_type === "TBM").length, color: "bg-purple-50 text-purple-700" },
                { label: "Horas/Ciclo", value: `${totalHours}h`, color: "bg-amber-50 text-amber-700" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-lg p-3 text-center ${color}`}>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>

            {/* Tasks Table */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["ID Tarea", "Equipo", "Descripción de Tarea", "Tipo", "Frecuencia", "Duración", "Recurso", "Estado"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((task) => {
                  const eq = EQUIPMENT_LIST.find(e => e.tag === task.equipment_tag);
                  return (
                    <tr key={task.task_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{task.task_id}</td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800">{task.equipment_tag}</p>
                        {eq && <span className={`text-xs px-1 py-0.5 rounded border ${criticalityColor(eq.criticality)}`}>{eq.criticality}</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 max-w-xs">{task.task_description}</td>
                      <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${taskTypeColor(task.task_type)}`}>{task.task_type}</span></td>
                      <td className="px-3 py-2 text-xs text-gray-600">{task.frequency}</td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-700">{task.duration_h}h</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{task.resource}</td>
                      <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(task.status)}`}>{task.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "decision" && (
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Árbol de Decisión RCM — Selección de Tipo de Tarea</h3>
            <div className="space-y-4">
              {rcmDecisionTree.map((node) => (
                <div key={node.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{node.step}</div>
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                      <p className="text-sm font-semibold text-gray-800">❓ {node.question}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap ml-4">
                      {node.options.map((opt) => (
                        <div key={opt} className={`rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-1.5 ${opt.includes("Sí") ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          <span>{opt.includes("Sí") ? "✓" : "✗"}</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Task Type Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: "CBM", desc: "Condition Based Maintenance", detail: "Monitoreo de condición, análisis de vibración, termografía, análisis de aceite" },
                { type: "TBM", desc: "Time Based Maintenance", detail: "Reemplazo preventivo a intervalos fijos, lubricación periódica" },
                { type: "RTF", desc: "Run To Failure", detail: "Dejar fallar (no crítico, fácil reemplazo, bajo costo consecuencia)" },
                { type: "FTM", desc: "Find & Tag Method", detail: "Fallas ocultas: pruebas funcionales periódicas para confirmar disponibilidad" },
              ].map(({ type, desc, detail }) => (
                <div key={type} className={`rounded-xl border p-3 ${taskTypeColor(type)}`}>
                  <p className="font-bold">{type}</p>
                  <p className="text-xs font-semibold opacity-80 mt-0.5">{desc}</p>
                  <p className="text-xs mt-1.5 opacity-70">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
