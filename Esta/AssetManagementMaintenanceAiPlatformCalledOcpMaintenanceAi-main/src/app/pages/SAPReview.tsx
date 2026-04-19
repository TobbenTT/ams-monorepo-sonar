import { SAP_WORK_ORDERS, EQUIPMENT_LIST, statusColor } from "../data/mockData";
import { Database, Upload, CheckCircle, AlertCircle, Link } from "lucide-react";

const SAP_STATUS: Record<string, { label: string; color: string }> = {
  TECO: { label: "Completado Técnico", color: "bg-green-100 text-green-700" },
  CONF: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  CLSD: { label: "Cerrado", color: "bg-gray-100 text-gray-600" },
  REL: { label: "Liberado", color: "bg-purple-100 text-purple-700" },
  CRTD: { label: "Creado", color: "bg-amber-100 text-amber-700" },
};

const ORDER_TYPES: Record<string, string> = {
  PM01: "Inspección",
  PM02: "Preventivo",
  PM03: "Correctivo",
};

export function SAPReview() {
  const totalCost = SAP_WORK_ORDERS.reduce((a, b) => a + b.material_costs + b.labor_costs, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">🏭 Integración SAP PM</h1>
        <p className="text-sm text-gray-500">SAP Plant Maintenance · Read-only · Sandbox validado</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Database className="text-blue-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">SAP ECC 6.0 — OCP Jorf Lasfar</h3>
            <p className="text-xs text-gray-500">Plant: 1000 (JFC-1) · Client: 800 · Modo: Read-only</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            <CheckCircle size={12} /> Conectado (Mock)
          </div>
        </div>
      </div>

      {/* SAP Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Entidades SAP PM", items: ["Equipo (IE01/IE02)", "Posición Funcional (IL01)", "Órdenes de Mantenimiento (IW31)", "Plan de Mantenimiento (IP01)", "Hoja de Ruta (IA01)", "Reserva de Material (MIGO)"] },
          { label: "Transacciones Clave", items: ["IW38 — Listado OTs", "IW39 — Vista OTs", "IP10 — Crear PM Plan", "IP17 — PM Plan (Eq)", "QM01 — Notificación QM", "MB51 — Movimientos Mat."] },
          { label: "Upload Templates", items: ["Maintenance Item.xlsx (18 campos)", "Task List.xlsx (24 campos)", "Work Plan.xlsx (22 campos)", "— Total: 64 campos SAP PM", "— Cross-ref model: TAG ↔ SAP Eq#"] },
        ].map(({ label, items }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">{label}</h3>
            <ul className="space-y-1.5">
              {items.map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Órdenes Revisadas", value: SAP_WORK_ORDERS.length, color: "bg-blue-50 text-blue-700" },
          { label: "Cerradas / Técnico", value: SAP_WORK_ORDERS.filter(w => ["TECO", "CLSD"].includes(w.status)).length, color: "bg-green-50 text-green-700" },
          { label: "Costo Total", value: `${(totalCost / 1000).toFixed(0)}K MAD`, color: "bg-amber-50 text-amber-700" },
          { label: "En Ejecución", value: SAP_WORK_ORDERS.filter(w => w.status === "REL").length, color: "bg-purple-50 text-purple-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border border-gray-200 p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Link size={16} /> Órdenes de Trabajo SAP PM</h3>
          <button className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
            <Upload size={12} /> Exportar a SAP
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["N° OT SAP", "Equipo TAG", "Tipo OT", "Descripción", "Estado SAP", "Planta", "Inicio", "Fin", "H. Plan.", "H. Real", "Mat. (MAD)", "M.O. (MAD)"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SAP_WORK_ORDERS.map((wo) => {
                const status = SAP_STATUS[wo.status] ?? { label: wo.status, color: "bg-gray-100 text-gray-600" };
                const deviation = wo.actual_work - wo.planned_work;
                return (
                  <tr key={wo.wo_number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs font-bold text-blue-700">{wo.wo_number}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800">{wo.equipment_tag}</td>
                    <td className="px-3 py-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-700">{wo.order_type}</span>
                        <p className="text-xs text-gray-400">{ORDER_TYPES[wo.order_type]}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 max-w-[180px] truncate">{wo.description}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{wo.plant}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{wo.basic_start}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{wo.basic_finish}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{wo.planned_work}h</td>
                    <td className="px-3 py-2.5">
                      {wo.actual_work > 0 ? (
                        <span className={`text-xs font-semibold ${deviation > 0 ? "text-red-600" : "text-green-600"}`}>
                          {wo.actual_work}h {deviation !== 0 && `(${deviation > 0 ? "+" : ""}${deviation}h)`}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-700">{wo.material_costs.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700">{wo.labor_costs.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={10} className="px-3 py-2 text-xs font-bold text-gray-700 text-right">Totales:</td>
                <td className="px-3 py-2 text-xs font-bold text-gray-900">{SAP_WORK_ORDERS.reduce((a, b) => a + b.material_costs, 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-xs font-bold text-gray-900">{SAP_WORK_ORDERS.reduce((a, b) => a + b.labor_costs, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Upload Process */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Proceso de Upload a SAP PM — 4 Pasos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: "1", title: "Generar Templates", desc: "El sistema genera los 3 archivos Excel (Maintenance Item, Task List, Work Plan) con los datos validados", status: "done" },
            { step: "2", title: "Revisión QA", desc: "El planificador revisa los 40+ campos de validación. El IA marca inconsistencias automáticamente.", status: "done" },
            { step: "3", title: "Sandbox Test", desc: "Upload al sistema SAP sandbox para validación sin impacto en producción.", status: "in_progress" },
            { step: "4", title: "Upload Producción", desc: "Upload final al sistema SAP productivo. Requiere autorización del supervisor.", status: "pending" },
          ].map(({ step, title, desc, status }) => (
            <div key={step} className={`rounded-xl border p-4 ${status === "done" ? "bg-green-50 border-green-200" : status === "in_progress" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${status === "done" ? "bg-green-500" : status === "in_progress" ? "bg-blue-500" : "bg-gray-300"}`}>
                  {status === "done" ? "✓" : step}
                </div>
                <span className="text-sm font-semibold text-gray-800">{title}</span>
              </div>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
