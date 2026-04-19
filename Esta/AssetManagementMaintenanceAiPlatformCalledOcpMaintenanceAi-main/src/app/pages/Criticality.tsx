import { useState } from "react";
import { CRITICALITY_MATRIX, criticalityColor } from "../data/mockData";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { Gauge, AlertTriangle } from "lucide-react";

const FACTORS = [
  { key: "production_impact", label: "Impacto en Producción" },
  { key: "safety_risk", label: "Riesgo de Seguridad" },
  { key: "environmental_risk", label: "Riesgo Ambiental" },
  { key: "maintenance_cost", label: "Costo de Mantenimiento" },
  { key: "availability_impact", label: "Impacto en Disponibilidad" },
  { key: "regulatory", label: "Requisitos Regulatorios" },
];

const LEVEL_COLORS: Record<string, string> = {
  Alto: "#EF4444",
  Moderado: "#F59E0B",
  Bajo: "#10B981",
};

export function Criticality() {
  const [selected, setSelected] = useState<any>(null);
  const [filterLevel, setFilterLevel] = useState("Todos");

  const filtered = CRITICALITY_MATRIX.filter(c => filterLevel === "Todos" || c.level === filterLevel);

  // Scatter plot data: x = production_impact, y = safety_risk
  const scatterData = CRITICALITY_MATRIX.map(c => ({
    x: c.production_impact,
    y: c.safety_risk,
    name: c.equipment_tag,
    score: c.total_score,
    level: c.level,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">⚖️ Análisis de Criticidad de Activos</h1>
        <p className="text-sm text-gray-500">Método semi-cuantitativo · 6 factores · Matriz 5×5 · ALARP Zones</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { level: "Alto (AA/A+)", count: CRITICALITY_MATRIX.filter(c => c.level === "Alto").length, color: "bg-red-50 text-red-700 border-red-200", range: "Puntaje 19-25" },
          { level: "Moderado (A/B)", count: CRITICALITY_MATRIX.filter(c => c.level === "Moderado").length, color: "bg-amber-50 text-amber-700 border-amber-200", range: "Puntaje 8-18" },
          { level: "Bajo (C/D)", count: CRITICALITY_MATRIX.filter(c => c.level === "Bajo").length, color: "bg-green-50 text-green-700 border-green-200", range: "Puntaje 1-7" },
        ].map(({ level, count, color, range }) => (
          <div key={level} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm font-semibold">{level}</p>
            <p className="text-xs opacity-75">{range}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Mapa de Criticidad: Impacto Producción vs Seguridad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
              <XAxis dataKey="x" name="Impacto Producción" label={{ value: "Impacto Producción", position: "bottom", fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 6]} />
              <YAxis dataKey="y" name="Riesgo Seguridad" label={{ value: "Riesgo Seg.", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 6]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow">
                    <p className="font-bold">{d.name}</p>
                    <p>Score: {d.score} — {d.level}</p>
                  </div>
                );
              }} />
              <Scatter data={scatterData} name="Equipos">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={LEVEL_COLORS[entry.level] ?? "#6B7280"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            {Object.entries(LEVEL_COLORS).map(([level, color]) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-600">{level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Factor Scoring Calculator */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Factores de Evaluación (1-5)</h3>
          {selected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-800">{selected.equipment_name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${criticalityColor(selected.class)}`}>{selected.class}</span>
              </div>
              {FACTORS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-44 flex-shrink-0">{label}</span>
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`flex-1 h-6 rounded text-xs flex items-center justify-center font-bold ${(selected as any)[key] >= n ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-400"}`}>{n}</div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-4">{(selected as any)[key]}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Puntaje Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{selected.total_score}</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${selected.level === "Alto" ? "bg-red-100 text-red-700" : selected.level === "Moderado" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{selected.level}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Selecciona un equipo para ver su puntuación detallada
            </div>
          )}
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Ranking de Criticidad</h3>
          <div className="flex gap-2">
            {["Todos", "Alto", "Moderado", "Bajo"].map(l => (
              <button key={l} onClick={() => setFilterLevel(l)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterLevel === l ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600"}`}>{l}</button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Equipo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Clase</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Nivel</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Puntaje</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Perfil</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.sort((a, b) => b.total_score - a.total_score).map((eq, i) => (
              <tr key={eq.equipment_tag} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.equipment_tag === eq.equipment_tag ? "bg-green-50" : ""}`} onClick={() => setSelected(eq)}>
                <td className="px-4 py-3 text-xs font-bold text-gray-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-xs text-gray-800">{eq.equipment_tag}</p>
                  <p className="text-xs text-gray-500">{eq.equipment_name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${criticalityColor(eq.class)}`}>{eq.class}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${eq.level === "Alto" ? "bg-red-100 text-red-700" : eq.level === "Moderado" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{eq.level}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[#2E7D32]" style={{ width: `${(eq.total_score / 25) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-800">{eq.total_score}/25</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {FACTORS.map(({ key }) => (
                      <div key={key} className={`w-2 h-4 rounded-sm ${(eq as any)[key] >= 4 ? "bg-red-400" : (eq as any)[key] >= 3 ? "bg-amber-400" : "bg-green-400"}`} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-green-700 hover:underline">Ver detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
