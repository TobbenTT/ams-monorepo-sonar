import { useState } from "react";
import { DEFECT_CASES } from "../data/mockData";
import { Bug, AlertTriangle, CheckCircle, Clock, ChevronRight, Plus, Target } from "lucide-react";

const STAGES = ["Identificar", "Priorizar", "Analizar", "Implementar", "Controlar"];

const stageColor = (stage: number, current: number) => {
  if (stage < current) return "bg-green-500 text-white";
  if (stage === current - 1) return "bg-[#2E7D32] text-white";
  return "bg-gray-200 text-gray-400";
};

const PRIORITY_COLORS: Record<string, string> = {
  ALTO: "bg-red-100 text-red-700 border-red-200",
  MODERADO: "bg-amber-100 text-amber-700 border-amber-200",
  BAJO: "bg-green-100 text-green-700 border-green-200",
};

export function DefectElimination() {
  const [selected, setSelected] = useState(DEFECT_CASES[0]);
  const [activeTab, setActiveTab] = useState<"5w" | "rca" | "solutions">("5w");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🐛 Eliminación de Defectos</h1>
          <p className="text-sm text-gray-500">Proceso DE 5 etapas · Metodología RCA · 5W+2H · 5P's Evidence Framework</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2E7D32] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-all">
          <Plus size={16} /> Nuevo Caso DE
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Casos Activos", value: DEFECT_CASES.filter(d => d.status !== "COMPLETED").length, color: "bg-blue-50 text-blue-700" },
          { label: "Completados", value: DEFECT_CASES.filter(d => d.status === "COMPLETED").length, color: "bg-green-50 text-green-700" },
          { label: "Recurrencia Total", value: DEFECT_CASES.reduce((a, b) => a + b.recurrence_count, 0), color: "bg-red-50 text-red-700" },
          { label: "Acciones Abiertas", value: DEFECT_CASES.flatMap(d => d.solutions).filter(s => s.status !== "COMPLETED").length, color: "bg-amber-50 text-amber-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border border-gray-200 p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Casos DE</h3>
          {DEFECT_CASES.map((dc) => (
            <div
              key={dc.id}
              onClick={() => setSelected(dc)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:border-green-300 ${selected.id === dc.id ? "border-[#2E7D32] bg-green-50" : "border-gray-200"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{dc.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${PRIORITY_COLORS[dc.priority]}`}>{dc.priority}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{dc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{dc.equipment_tag}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
              </div>

              {/* Stage Progress */}
              <div className="mt-3 flex gap-1">
                {STAGES.map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full ${i < dc.stage ? "bg-green-500" : i === dc.stage - 1 ? "bg-[#2E7D32]" : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{STAGES[dc.stage - 1] ?? "Completado"} · Recurrencias: {dc.recurrence_count}</p>
            </div>
          ))}
        </div>

        {/* Case Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Stage Bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">{selected.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${i < selected.stage ? "bg-green-100 text-green-700" : i === selected.stage - 1 ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i < selected.stage ? <CheckCircle size={10} /> : <span className="w-3 h-3 rounded-full border-2 border-current flex-shrink-0" />}
                    {stage}
                  </div>
                  {i < STAGES.length - 1 && <div className={`w-4 h-0.5 ${i < selected.stage ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-5 flex gap-4">
            {(["5w", "rca", "solutions"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? "border-[#2E7D32] text-[#2E7D32]" : "border-transparent text-gray-500"}`}>
                {tab === "5w" ? "5W+2H Análisis" : tab === "rca" ? "RCA — Causa Raíz" : "Acciones & Soluciones"}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "5w" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {selected.five_w_answers && Object.entries(selected.five_w_answers).map(([key, value]) => (
                    <div key={key} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-12 flex-shrink-0">
                        <span className="text-xs font-bold text-gray-500 uppercase bg-white border border-gray-200 rounded px-1.5 py-0.5">
                          {key.toUpperCase().replace("WHAT", "QUÉ").replace("WHEN", "CUÁNDO").replace("WHERE", "DÓNDE").replace("WHO", "QUIÉN").replace("WHY", "POR QUÉ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "rca" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 uppercase mb-2 flex items-center gap-1.5"><Target size={12} /> Metodología: {selected.rca_method}</p>
                </div>
                {[
                  { level: "🔴 Causa Física", desc: "¿Qué se rompió o falló físicamente?", value: selected.physical_cause, color: "bg-red-50 border-red-200 text-red-800" },
                  { level: "🟡 Causa Humana", desc: "¿Qué acción u omisión causó la falla?", value: selected.human_cause, color: "bg-amber-50 border-amber-200 text-amber-800" },
                  { level: "🟢 Causa Latente", desc: "¿Por qué el sistema permitió el error?", value: selected.latent_cause, color: "bg-green-50 border-green-200 text-green-800" },
                ].map(({ level, desc, value, color }) => (
                  <div key={level} className={`rounded-xl border p-4 ${color}`}>
                    <p className="font-bold text-sm">{level}</p>
                    <p className="text-xs opacity-75 mt-0.5">{desc}</p>
                    <p className="text-sm mt-2">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "solutions" && (
              <div className="space-y-3">
                {selected.solutions.map((sol, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${sol.status === "COMPLETED" ? "bg-green-50 border-green-200" : sol.status === "IN_PROGRESS" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{sol.action}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span>👤 {sol.responsible}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {sol.due_date}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                        sol.status === "COMPLETED" ? "bg-green-200 text-green-800" :
                        sol.status === "IN_PROGRESS" ? "bg-blue-200 text-blue-800" :
                        "bg-gray-200 text-gray-700"
                      }`}>{sol.status.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}

                {selected.kpis && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Recurrencias", value: selected.kpis.recurrence_rate },
                      { label: "MTBD (h)", value: selected.kpis.mean_time_between_defects },
                      { label: "Tiempo Resol. (días)", value: selected.kpis.resolution_time ?? "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
