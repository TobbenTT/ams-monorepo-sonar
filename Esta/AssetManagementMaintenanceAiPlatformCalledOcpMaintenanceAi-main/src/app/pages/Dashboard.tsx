import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { AlertTriangle, Clock, Archive, TrendingUp, ArrowRight, CheckCircle, AlertCircle, Activity, Zap } from "lucide-react";
import { WORK_REQUESTS, BACKLOG_ITEMS, KPI_HISTORY, EQUIPMENT_LIST, statusColor } from "../data/mockData";

const MetricCard = ({ title, value, sub, icon: Icon, color, delta }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      {delta && <p className={`text-xs mt-0.5 font-medium ${delta.positive ? "text-green-600" : "text-red-600"}`}>{delta.text}</p>}
    </div>
  </div>
);

export function Dashboard() {
  const navigate = useNavigate();
  const pending = WORK_REQUESTS.filter(w => w.status === "PENDING_VALIDATION");
  const critical = BACKLOG_ITEMS.filter(b => b.priority === "P1");
  const runningPct = Math.round((EQUIPMENT_LIST.filter(e => e.status === "RUNNING").length / EQUIPMENT_LIST.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] rounded-2xl px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">OCP Maintenance AI</h1>
            <p className="text-green-200 text-sm mt-1">Plataforma Inteligente de Gestión de Activos — Jorf Lasfar Complex</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-green-200 text-xs">Última actualización</p>
            <p className="text-white text-sm font-semibold">Jueves, 26 Feb 2026 · 11:42</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Adherencia Programas", value: "93.1%", icon: "📈", color: "bg-white/15" },
            { label: "Misclasificación P1", value: "28%", icon: "⬇️", color: "bg-white/15" },
            { label: "Tiempo Planificación", value: "78 min", icon: "⏱️", color: "bg-white/15" },
            { label: "OEE Promedio", value: "86.5%", icon: "⚙️", color: "bg-white/15" },
          ].map((m) => (
            <div key={m.label} className={`${m.color} rounded-xl p-3`}>
              <span className="text-lg">{m.icon}</span>
              <p className="text-white font-bold text-lg mt-1">{m.value}</p>
              <p className="text-green-200 text-xs">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Capturas de Campo" value="24" sub="Esta semana" icon={Activity} color="bg-[#2E7D32]" delta={{ text: "+12% vs semana ant.", positive: true }} />
        <MetricCard title="Pendientes Validación" value={pending.length} sub="Solicitudes activas" icon={AlertTriangle} color="bg-amber-500" delta={{ text: `${pending.length} requieren acción`, positive: false }} />
        <MetricCard title="Backlog Total" value={BACKLOG_ITEMS.length} sub={`${critical.length} críticos (P1)`} icon={Archive} color="bg-blue-600" />
        <MetricCard title="Equipos Operativos" value={`${runningPct}%`} sub={`${EQUIPMENT_LIST.filter(e => e.status === "RUNNING").length}/${EQUIPMENT_LIST.length} equipos`} icon={CheckCircle} color="bg-emerald-600" delta={{ text: "Disponibilidad normal", positive: true }} />
      </div>

      {/* Charts + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Evolución de KPIs — Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={KPI_HISTORY}>
              <defs>
                <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="schedule_adherence" name="Adherencia (%)" stroke="#2E7D32" fill="url(#colorAdherence)" strokeWidth={2} />
              <Area type="monotone" dataKey="priority_misclassification" name="Misclasificación (%)" stroke="#F59E0B" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Acciones Rápidas</h3>
          <div className="space-y-2">
            {[
              { label: "Nueva Captura de Campo", path: "/field-capture", color: "bg-[#2E7D32] text-white", badge: null },
              { label: `Revisar Solicitudes (${pending.length})`, path: "/work-requests", color: "bg-amber-50 text-amber-800 border border-amber-200", badge: pending.length },
              { label: "Ver Backlog", path: "/backlog", color: "bg-gray-50 text-gray-700 border border-gray-200", badge: null },
              { label: "Planificación Semanal", path: "/scheduling", color: "bg-gray-50 text-gray-700 border border-gray-200", badge: null },
              { label: "Asistente IA Planificador", path: "/planner", color: "bg-gray-50 text-gray-700 border border-gray-200", badge: null },
              { label: "Dashboard Ejecutivo", path: "/executive", color: "bg-gray-50 text-gray-700 border border-gray-200", badge: null },
            ].map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 ${a.color}`}
              >
                <span>{a.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Actividad Reciente — Solicitudes de Trabajo</h3>
          <button onClick={() => navigate("/work-requests")} className="text-sm text-green-700 hover:underline flex items-center gap-1">Ver todas <ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="space-y-2">
          {WORK_REQUESTS.slice(0, 6).map((wr) => (
            <div key={wr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate("/work-requests")}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${wr.production_impact === "CRITICAL" ? "bg-red-500" : wr.production_impact === "HIGH" ? "bg-orange-400" : "bg-yellow-400"}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{wr.equipment_tag}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{wr.failure_description.slice(0, 60)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">{wr.created_at.slice(0, 10)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(wr.status)}`}>{wr.status.replace("_", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
