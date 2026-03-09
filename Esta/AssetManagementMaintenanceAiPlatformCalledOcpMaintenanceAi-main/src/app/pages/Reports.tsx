import { useState } from "react";
import { FileText, Download, Calendar, Filter, Eye, BarChart2 } from "lucide-react";
import { WORK_REQUESTS, BACKLOG_ITEMS, RELIABILITY_KPIs, SCHEDULE_WEEKS } from "../data/mockData";

const REPORT_TEMPLATES = [
  { id: "weekly", title: "Informe Semanal de Mantenimiento", type: "Operativo", frequency: "Semanal", lastGen: "2026-02-26", status: "Generado", icon: "📋" },
  { id: "backlog", title: "Análisis de Backlog", type: "Analítico", frequency: "Semanal", lastGen: "2026-02-25", status: "Generado", icon: "📦" },
  { id: "kpi", title: "Dashboard KPIs Ejecutivos", type: "Ejecutivo", frequency: "Mensual", lastGen: "2026-02-01", status: "Generado", icon: "📊" },
  { id: "reliability", title: "Informe de Confiabilidad", type: "Técnico", frequency: "Mensual", lastGen: "2026-02-01", status: "Pendiente", icon: "📈" },
  { id: "sap", title: "Cierre de Órdenes SAP PM", type: "SAP", frequency: "Semanal", lastGen: "2026-02-21", status: "Generado", icon: "🏭" },
  { id: "fmea", title: "Revisión FMEA/FMECA", type: "Técnico", frequency: "Trimestral", lastGen: "2026-01-15", status: "Próximo", icon: "🔬" },
];

const DATA_EXPORTS = [
  { name: "Solicitudes de Trabajo (WR)", count: WORK_REQUESTS.length, format: "CSV/XLSX", icon: "📋" },
  { name: "Backlog Items", count: BACKLOG_ITEMS.length, format: "CSV/XLSX", icon: "📦" },
  { name: "KPIs de Confiabilidad", count: RELIABILITY_KPIs.length, format: "XLSX", icon: "📈" },
  { name: "Órdenes SAP PM", count: 4, format: "SAP Upload", icon: "🏭" },
];

export function Reports() {
  const [preview, setPreview] = useState<any>(null);

  const weeklyReport = {
    week: SCHEDULE_WEEKS[0].week,
    adherence: SCHEDULE_WEEKS[0].adherence,
    planned: SCHEDULE_WEEKS[0].planned_hours,
    executed: SCHEDULE_WEEKS[0].executed_hours,
    wo_total: SCHEDULE_WEEKS[0].work_orders.length,
    wo_completed: SCHEDULE_WEEKS[0].work_orders.filter(w => w.status === "COMPLETED").length,
    open_wr: WORK_REQUESTS.filter(w => ["DRAFT", "PENDING_VALIDATION"].includes(w.status)).length,
    backlog: BACKLOG_ITEMS.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📄 Reportes & Gestión de Datos</h1>
        <p className="text-sm text-gray-500">Informes automáticos · Exportación de datos · Plantillas SAP</p>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText size={16} /> Plantillas de Informes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TEMPLATES.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:bg-green-50 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{report.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{report.title}</p>
                    <p className="text-xs text-gray-500">{report.type} · {report.frequency}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Último: {report.lastGen}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${report.status === "Generado" ? "bg-green-100 text-green-700" : report.status === "Pendiente" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {report.status}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setPreview(report)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                    <Eye size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white transition-all">
                    <Download size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><BarChart2 size={16} /> Preview — Informe Semanal {weeklyReport.week}</h3>
          <button className="flex items-center gap-1.5 text-xs bg-[#2E7D32] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#1B5E20] transition-all">
            <Download size={12} /> Descargar PDF
          </button>
        </div>
        <div className="border-l-4 border-[#2E7D32] pl-4 mb-4">
          <h4 className="font-bold text-gray-700">OCP Maintenance AI — Informe Semanal</h4>
          <p className="text-xs text-gray-500">Semana {weeklyReport.week} · Jorf Lasfar Complex · Confidencial</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Adherencia al Programa", value: `${weeklyReport.adherence}%`, ok: weeklyReport.adherence >= 90 },
            { label: "OTs Completadas", value: `${weeklyReport.wo_completed}/${weeklyReport.wo_total}`, ok: weeklyReport.wo_completed === weeklyReport.wo_total },
            { label: "WR Pendientes", value: weeklyReport.open_wr, ok: weeklyReport.open_wr < 5 },
            { label: "Backlog Total", value: weeklyReport.backlog, ok: weeklyReport.backlog < 15 },
          ].map(({ label, value, ok }) => (
            <div key={label} className={`rounded-lg p-3 border ${ok ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-xl font-bold ${ok ? "text-green-700" : "text-amber-700"}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 space-y-1.5 border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">Resumen Ejecutivo</p>
          <p>• Adherencia del programa: <strong>{weeklyReport.adherence}%</strong> (objetivo: 90%) — <span className="text-green-600 font-medium">✓ CUMPLIDO</span></p>
          <p>• {weeklyReport.wo_completed} de {weeklyReport.wo_total} órdenes de trabajo completadas — eficiencia de ejecución: {Math.round((weeklyReport.wo_completed/weeklyReport.wo_total)*100)}%</p>
          <p>• Backlog: {weeklyReport.backlog} ítems pendientes — {BACKLOG_ITEMS.filter(b => b.reason === "AWAITING_MATERIALS").length} por materiales, {BACKLOG_ITEMS.filter(b => b.reason === "AWAITING_SHUTDOWN").length} por parada programada</p>
          <p>• {weeklyReport.open_wr} solicitudes pendientes de validación — requieren acción del planificador en próxima sesión</p>
          <p className="pt-2 border-t border-gray-200 text-gray-500 italic">Informe generado automáticamente por OCP Maintenance AI · {new Date().toLocaleDateString("es")}</p>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Download size={16} /> Exportación de Datos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DATA_EXPORTS.map((exp) => (
            <div key={exp.name} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{exp.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{exp.name}</p>
                  <p className="text-xs text-gray-500">{exp.count} registros · {exp.format}</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all">
                <Download size={12} /> Exportar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
