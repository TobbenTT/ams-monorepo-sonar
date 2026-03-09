import { useState } from "react";
import { CheckCircle, XCircle, Eye, Filter, Clock, AlertTriangle } from "lucide-react";
import { WORK_REQUESTS, statusColor, priorityColor, criticalityColor } from "../data/mockData";

const STATUS_FILTERS = ["Todos", "DRAFT", "PENDING_VALIDATION", "VALIDATED", "IN_PROGRESS", "SCHEDULED"];

export function WorkRequests() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const filtered = WORK_REQUESTS.filter(wr => {
    const matchFilter = filter === "Todos" || wr.status === filter;
    const matchSearch = !search || wr.equipment_tag.toLowerCase().includes(search.toLowerCase()) || wr.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📋 Solicitudes de Trabajo</h1>
          <p className="text-sm text-gray-500">{WORK_REQUESTS.length} solicitudes totales · {WORK_REQUESTS.filter(w => w.status === "PENDING_VALIDATION").length} pendientes de validación</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg">
          <AlertTriangle size={14} />
          {WORK_REQUESTS.filter(w => w.status === "PENDING_VALIDATION").length} requieren acción
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar TAG, ID..." className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID / Equipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Fallo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridad</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">IA Conf.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((wr) => (
              <tr key={wr.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{wr.id}</p>
                  <p className="text-xs text-gray-500">{wr.equipment_tag} · {wr.plant}</p>
                  <p className="text-xs text-gray-400">{wr.created_at.slice(0, 10)}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-xs text-gray-700 max-w-xs truncate">{wr.failure_description.slice(0, 60)}...</p>
                  <p className="text-xs text-gray-400 mt-0.5">{wr.failure_mode}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${priorityColor(wr.priority_requested)}`}>
                      Req: {wr.priority_requested}
                    </span>
                    {wr.priority_suggested !== wr.priority_requested && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-amber-600">→ IA:</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${priorityColor(wr.priority_suggested)}`}>{wr.priority_suggested}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(wr.status)}`}>{wr.status.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${wr.ai_confidence >= 90 ? "bg-green-500" : wr.ai_confidence >= 75 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${wr.ai_confidence}%` }} />
                    </div>
                    <span className="text-xs text-gray-600">{wr.ai_confidence}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setSelected(wr)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                      <Eye size={14} />
                    </button>
                    {wr.status === "PENDING_VALIDATION" && (
                      <>
                        <button className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-all"><CheckCircle size={14} /></button>
                        <button className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"><XCircle size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selected.id} — Detalle</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Equipo", value: `${selected.equipment_tag} · ${selected.equipment_name}` },
                { label: "Planta / Área", value: `${selected.plant} / ${selected.area}` },
                { label: "Técnico", value: selected.technician },
                { label: "Duración Est.", value: `${selected.estimated_duration}h` },
                { label: "Impacto Prod.", value: selected.production_impact },
                { label: "Confianza IA", value: `${selected.ai_confidence}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Descripción del Fallo</p>
              <p className="text-sm text-gray-800">{selected.failure_description}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Repuestos Identificados</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.spare_parts.map((sp: string) => (
                  <span key={sp} className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5">{sp}</span>
                ))}
              </div>
            </div>
            {selected.status === "PENDING_VALIDATION" && (
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                  <CheckCircle size={14} /> Validar
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-2">
                  <XCircle size={14} /> Rechazar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
