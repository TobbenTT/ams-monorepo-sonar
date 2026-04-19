import { useState } from "react";
import { Mic, MicOff, Camera, Cpu, CheckCircle, ChevronRight, AlertCircle, Send } from "lucide-react";
import { EQUIPMENT_LIST, FAILURE_MODES_CATALOG } from "../data/mockData";

const STAGES = ["Descripción", "Clasificación IA", "Validación", "Enviado"];

export function FieldCapture() {
  const [stage, setStage] = useState(0);
  const [recording, setRecording] = useState(false);
  const [form, setForm] = useState({
    equipment_tag: "",
    description: "",
    failure_mode: "",
    priority: "",
    spare_parts: "",
    technician: "Omar Tazi",
    plant: "JFC-1",
  });
  const [aiResult, setAiResult] = useState<any>(null);

  const simulateAI = () => {
    const eq = EQUIPMENT_LIST.find(e => e.tag === form.equipment_tag);
    const fm = FAILURE_MODES_CATALOG[Math.floor(Math.random() * 5)];
    setAiResult({
      equipment_tag: form.equipment_tag,
      equipment_name: eq?.name ?? "Equipo desconocido",
      failure_mode: fm.mechanism + " / " + fm.cause,
      priority_suggested: "P2",
      priority_original: form.priority || "P1",
      estimated_duration_h: 8,
      spare_parts: ["SKF Bearing 22230 CC", "Lubricant ISO VG 320 2L"],
      production_impact: "HIGH",
      confidence: 89,
      ai_notes: "Basado en historial: 3 fallas similares en SAG Mill. Prioridad ajustada de P1 → P2 según impacto y disponibilidad de recurso. Requiere validación del planificador.",
    });
    setStage(1);
  };

  const validate = () => setStage(2);
  const submit = () => setStage(3);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">📱 Captura en Campo</h1>
        <p className="text-sm text-gray-500 mt-1">Registro inteligente de solicitudes de trabajo desde campo</p>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < stage ? "bg-green-500 text-white" : i === stage ? "bg-[#2E7D32] text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {i < stage ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden md:block ${i === stage ? "text-green-800" : "text-gray-400"}`}>{s}</span>
              {i < STAGES.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stage ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Stage 0: Input Form */}
      {stage === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Mic className="text-green-700" size={18} /> Descripción del Problema</h2>

          {/* Voice Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRecording(!recording)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${recording ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {recording ? <MicOff size={16} /> : <Mic size={16} />}
              {recording ? "Grabando... (clic para detener)" : "Grabar descripción de voz"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
              <Camera size={16} /> Adjuntar foto
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Planta</label>
              <select value={form.plant} onChange={e => setForm(p => ({...p, plant: e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {["JFC-1", "JFC-2", "JFC-3", "BK-1", "BK-2"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">TAG del Equipo *</label>
              <select value={form.equipment_tag} onChange={e => setForm(p => ({...p, equipment_tag: e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">— Seleccionar equipo —</option>
                {EQUIPMENT_LIST.filter(e => e.plant === form.plant).map(e => <option key={e.tag} value={e.tag}>{e.tag} — {e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Descripción del Fallo *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                rows={3}
                placeholder="Describe lo que observas en campo: ruidos, temperatura, vibración, fugas..."
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Modo de Fallo</label>
                <select value={form.failure_mode} onChange={e => setForm(p => ({...p, failure_mode: e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">— IA lo clasificará —</option>
                  {FAILURE_MODES_CATALOG.slice(0, 6).map(f => <option key={f.mechanism + f.cause}>{f.mechanism} / {f.cause}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prioridad Solicitada</label>
                <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">— IA sugerirá —</option>
                  {["P1 - Urgente", "P2 - Alta", "P3 - Media", "P4 - Baja"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Técnico</label>
              <input value={form.technician} onChange={e => setForm(p => ({...p, technician: e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <button
            onClick={simulateAI}
            disabled={!form.equipment_tag || !form.description}
            className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Cpu size={16} /> Clasificar con IA <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Stage 1: AI Classification */}
      {stage === 1 && aiResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="text-[#2E7D32]" size={20} />
            <h2 className="font-semibold text-gray-800">Clasificación IA — Resultados</h2>
            <span className="ml-auto bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">Confianza: {aiResult.confidence}%</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm font-semibold text-amber-800">Ajuste de Prioridad Detectado</p>
                <p className="text-xs text-amber-700 mt-1">Solicitud original: <strong>{aiResult.priority_original}</strong> → Sugerencia IA: <strong>{aiResult.priority_suggested}</strong></p>
                <p className="text-xs text-amber-600 mt-1">{aiResult.ai_notes}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "TAG Equipo", value: aiResult.equipment_tag },
              { label: "Nombre Equipo", value: aiResult.equipment_name },
              { label: "Modo de Fallo", value: aiResult.failure_mode },
              { label: "Prioridad Sugerida", value: aiResult.priority_suggested },
              { label: "Duración Estimada", value: `${aiResult.estimated_duration_h}h` },
              { label: "Impacto Producción", value: aiResult.production_impact },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-2">Repuestos Sugeridos por IA</p>
            <div className="flex flex-wrap gap-2">
              {aiResult.spare_parts.map((sp: string) => (
                <span key={sp} className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1">{sp}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStage(0)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Editar</button>
            <button onClick={validate} className="flex-1 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-medium hover:bg-[#1B5E20] transition-all">Confirmar y Validar →</button>
          </div>
        </div>
      )}

      {/* Stage 2: Human Validation */}
      {stage === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">✅ Validación Humana Requerida</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>Safety First:</strong> La IA nunca auto-envía. El planificador debe validar antes de enviar a SAP PM.
          </div>
          <div className="space-y-3">
            {["Prioridad confirmada: P2", "Modo de fallo validado", "Repuestos verificados en almacén", "Recursos humanos disponibles semana W09"].map(item => (
              <label key={item} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input type="checkbox" className="w-4 h-4 accent-green-700" />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
          <button onClick={submit} className="w-full py-3 rounded-xl bg-[#2E7D32] text-white font-semibold text-sm hover:bg-[#1B5E20] transition-all flex items-center justify-center gap-2">
            <Send size={16} /> Enviar Solicitud de Trabajo
          </button>
        </div>
      )}

      {/* Stage 3: Submitted */}
      {stage === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">¡Solicitud Enviada!</h2>
          <p className="text-sm text-gray-500">La solicitud <strong>WR-2026-009</strong> ha sido creada y enviada al planificador.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Número de OT", value: "WR-2026-009" },
              { label: "Prioridad", value: "P2" },
              { label: "Estado", value: "PENDIENTE" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setStage(0)} className="mt-2 text-sm text-green-700 hover:underline">+ Nueva captura</button>
        </div>
      )}
    </div>
  );
}
