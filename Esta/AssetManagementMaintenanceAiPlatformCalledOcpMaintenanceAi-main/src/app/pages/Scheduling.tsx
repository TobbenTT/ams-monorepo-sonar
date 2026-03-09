import { useState } from "react";
import { Calendar, Clock, Users, CheckCircle, Circle, Play, Pause } from "lucide-react";
import { SCHEDULE_WEEKS } from "../data/mockData";

const TYPE_COLORS: Record<string, string> = {
  PM01: "bg-blue-100 text-blue-800 border-blue-200",
  PM02: "bg-green-100 text-green-800 border-green-200",
  PM03: "bg-red-100 text-red-800 border-red-200",
};
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800",
  PLANNED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
};

export function Scheduling() {
  const [activeWeek, setActiveWeek] = useState(0);
  const week = SCHEDULE_WEEKS[activeWeek];

  const daySlots = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📅 Planificación Semanal</h1>
        <p className="text-sm text-gray-500">Ciclo semanal: Preventivos del Plan Matriz + Correctivos de Avisos</p>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        {SCHEDULE_WEEKS.map((w, i) => (
          <button
            key={w.week}
            onClick={() => setActiveWeek(i)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeWeek === i ? "bg-[#2E7D32] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
          >
            <div>{w.week}</div>
            <div className="text-xs opacity-75 mt-0.5">{w.start} → {w.end}</div>
          </button>
        ))}
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Horas Planificadas", value: `${week.planned_hours}h`, icon: Calendar, color: "bg-blue-50 text-blue-600" },
          { label: "Horas Ejecutadas", value: `${week.executed_hours}h`, icon: Clock, color: "bg-green-50 text-green-600" },
          { label: "Adherencia", value: week.adherence > 0 ? `${week.adherence}%` : "—", icon: CheckCircle, color: week.adherence >= 90 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600" },
          { label: "Órdenes de Trabajo", value: week.work_orders.length, icon: Users, color: "bg-purple-50 text-purple-600" },
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

      {/* Adherence Bar */}
      {week.adherence > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Adherencia al Programa</span>
            <span className={`text-sm font-bold ${week.adherence >= 90 ? "text-green-600" : week.adherence >= 80 ? "text-amber-600" : "text-red-600"}`}>{week.adherence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${week.adherence >= 90 ? "bg-green-500" : week.adherence >= 80 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${week.adherence}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span className="text-amber-500">Objetivo: 90%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Gantt-style Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Órdenes de Trabajo — {week.week}</h3>
          <div className="flex gap-3 text-xs">
            {Object.entries(TYPE_COLORS).map(([type, cls]) => (
              <span key={type} className={`px-2 py-0.5 rounded-full border font-medium ${cls}`}>{type}</span>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {week.work_orders.map((wo) => (
            <div key={wo.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{wo.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_COLORS[wo.type]}`}>{wo.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[wo.status]}`}>{wo.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{wo.description}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{wo.duration_planned}h planificadas</span>
                    {wo.duration_actual > 0 && <span className="flex items-center gap-1 text-green-600"><CheckCircle size={11} />{wo.duration_actual}h reales</span>}
                    <span className="flex items-center gap-1"><Users size={11} />{wo.technicians.join(", ")}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {/* Mini progress bar */}
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1.5">
                    <div
                      className={`h-2 rounded-full ${wo.status === "COMPLETED" ? "bg-green-500" : wo.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-gray-300"}`}
                      style={{ width: wo.status === "COMPLETED" ? "100%" : wo.status === "IN_PROGRESS" ? "60%" : "0%" }}
                    />
                  </div>
                  {wo.duration_actual > 0 && wo.duration_actual !== wo.duration_planned && (
                    <p className={`text-xs mt-1 text-right font-medium ${wo.duration_actual > wo.duration_planned ? "text-red-600" : "text-green-600"}`}>
                      {wo.duration_actual > wo.duration_planned ? "+" : "-"}{Math.abs(wo.duration_actual - wo.duration_planned)}h
                    </p>
                  )}
                </div>
              </div>

              {/* Weekly day grid */}
              <div className="mt-3 flex gap-1">
                {daySlots.map((day, i) => {
                  const filled = wo.status === "COMPLETED" ? true : (wo.status === "IN_PROGRESS" && i === 0) ? true : false;
                  return (
                    <div key={day} className={`flex-1 text-center text-xs py-1.5 rounded ${filled ? "bg-green-100 text-green-700 font-medium" : wo.status === "PLANNED" && i < Math.ceil(wo.duration_planned / 8) ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-300"}`}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
