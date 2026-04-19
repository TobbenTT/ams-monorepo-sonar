import { useState } from "react";
import { FMEA_RECORDS, CRITICALITY_MATRIX, criticalityColor } from "../data/mockData";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const getClass = (rpn: number, critClass: string): string => {
  if (critClass === "AA" && rpn >= 150) return "CRÍTICO";
  if (critClass === "AA" || rpn >= 150) return "ALTO";
  if (critClass === "A+" || rpn >= 100) return "MEDIO-ALTO";
  if (rpn >= 50) return "MEDIO";
  return "BAJO";
};
const fmecaColor: Record<string, string> = {
  CRÍTICO: "bg-red-200 text-red-900 border-red-300",
  ALTO: "bg-red-100 text-red-700 border-red-200",
  "MEDIO-ALTO": "bg-orange-100 text-orange-700 border-orange-200",
  MEDIO: "bg-amber-100 text-amber-700 border-amber-200",
  BAJO: "bg-green-100 text-green-700 border-green-200",
};

export function FMECAPage() {
  const [selectedEq, setSelectedEq] = useState<string | null>(null);

  const fmecaData = FMEA_RECORDS.map(f => {
    const crit = CRITICALITY_MATRIX.find(c => c.equipment_tag === f.equipment_tag);
    const critClass = crit?.class ?? "B";
    const critScore = crit?.total_score ?? 10;
    const combined = f.rpn * (critScore / 25);
    const classification = getClass(f.rpn, critClass);
    return { ...f, critClass, critScore, combined: Math.round(combined), classification };
  });

  const filtered = selectedEq ? fmecaData.filter(f => f.equipment_tag === selectedEq) : fmecaData;
  const equipments = [...new Set(fmecaData.map(f => f.equipment_tag))];

  const radarData = [
    { subject: "Severidad", A: 9 }, { subject: "Ocurrencia", A: 5 }, { subject: "Detección", A: 4 },
    { subject: "Producción", A: 9 }, { subject: "Seguridad", A: 7 }, { subject: "Costo", A: 8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">🛡️ FMECA — Análisis de Criticidad</h1>
        <p className="text-sm text-gray-500">FMEA + Criticality Analysis · Combinación de RPN y Criticidad de Activo</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(fmecaColor).map(([level, cls]) => {
          const count = fmecaData.filter(f => f.classification === level).length;
          return (
            <div key={level} className={`rounded-xl border p-4 text-center ${cls}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-semibold mt-0.5">{level}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Perfil de Riesgo Promedio</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* FMECA Matrix Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Matriz FMECA</h3>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSelectedEq(null)} className={`px-2 py-1 rounded-lg text-xs font-medium ${!selectedEq ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600"}`}>Todos</button>
              {equipments.map(eq => (
                <button key={eq} onClick={() => setSelectedEq(eq)} className={`px-2 py-1 rounded-lg text-xs font-medium ${selectedEq === eq ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-600"}`}>{eq.replace("JFC1-", "").replace("JFC2-", "")}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Equipo", "Modo de Fallo", "S", "O", "D", "RPN", "Clase Crit.", "Score Crit.", "Comb.", "Clasificación FMECA"].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.sort((a, b) => b.combined - a.combined).map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-semibold text-gray-700">{f.equipment_tag}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[130px] truncate">{f.failure_mode}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-red-600">{f.severity}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-amber-600">{f.occurrence}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-blue-600">{f.detectability}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-gray-900">{f.rpn}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border font-bold ${criticalityColor(f.critClass)}`}>{f.critClass}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold text-gray-700">{f.critScore}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-gray-900">{f.combined}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${fmecaColor[f.classification]}`}>{f.classification}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
