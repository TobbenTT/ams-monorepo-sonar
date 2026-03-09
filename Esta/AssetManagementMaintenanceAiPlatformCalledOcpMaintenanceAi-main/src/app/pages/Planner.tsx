import { useState } from "react";
import { BrainCircuit, Send, Bot, User, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { WORK_REQUESTS, BACKLOG_ITEMS } from "../data/mockData";

const SUGGESTIONS = [
  "¿Cuál es el backlog crítico que debo priorizar esta semana?",
  "Optimiza el schedule de la semana W09-2026",
  "¿Qué trabajos pueden agruparse en el área de molienda?",
  "Analiza los factores de prioridad de WR-2026-001",
  "¿Cuáles equipos tienen mayor riesgo esta semana?",
];

type Msg = { role: "user" | "assistant"; content: string; time: string };

const AI_RESPONSES: Record<string, string> = {
  default: `**Análisis completado** ⚡

Basado en los datos actuales de JFC-1, aquí está mi análisis:

**🔴 Prioridad Inmediata:**
- **WR-2026-008** (Compresor JFC1-CO-001): Temperatura 95°C > límite 80°C. Riesgo de falla en parada. Recomiendo programar esta semana.

**🟡 Esta Semana (W09):**
- **WR-2026-001** (SAG Mill #1): Vibración 8.2mm/s. Coordinar con parada programada de Ball Mill #2 para optimizar recursos.
- **GRP-GRIND-01**: Agrupar trabajos SAG Mill + Ball Mill = ahorro 6h de preparación.

**💡 Insights de IA:**
- 50% de las solicitudes P1 son mal clasificadas (histórico). WR-2026-003 ajustado a P3.
- Materiales para WR-2026-003 (riding ring) no disponibles — retrasar o hacer pedido urgente.
- Disponibilidad semana W09: 280h planificadas, 3 técnicos especializados disponibles.

¿Quieres que genere el programa optimizado para W09?`,
};

export function Planner() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `¡Hola! Soy el **Asistente IA de Planificación** para OCP Jorf Lasfar.\n\nTengo acceso a:\n- ${WORK_REQUESTS.length} solicitudes de trabajo activas\n- ${BACKLOG_ITEMS.length} ítems en backlog\n- Historial de órdenes SAP PM\n- KPIs de confiabilidad y disponibilidad\n\n¿En qué te puedo ayudar hoy?`,
      time: "11:42",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: msg, time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(p => [...p, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const aiMsg: Msg = {
      role: "assistant",
      content: AI_RESPONSES.default,
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(p => [...p, aiMsg]);
    setLoading(false);
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-5 h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BrainCircuit className="text-[#2E7D32]" /> Asistente IA Planificador</h1>
          <p className="text-sm text-gray-500">Claude-powered · Análisis en tiempo real · Safety-first (human-in-the-loop)</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">
          <CheckCircle size={12} /> IA Activa
        </div>
      </div>

      {/* Context Cards */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {[
          { label: "Backlog", value: BACKLOG_ITEMS.length, sub: "ítems activos", color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Pendientes", value: WORK_REQUESTS.filter(w => w.status === "PENDING_VALIDATION").length, sub: "para validar", color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Críticos P1", value: BACKLOG_ITEMS.filter(b => b.priority === "P1").length, sub: "urgentes", color: "text-red-700 bg-red-50 border-red-200" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${color}`}>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs font-semibold">{label}</p>
            <p className="text-xs opacity-75">{sub}</p>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-[#2E7D32] text-white rounded-tr-sm"
                  : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm"
              }`}>
                <div dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
                <p className={`text-xs mt-1.5 ${msg.role === "user" ? "text-green-200" : "text-gray-400"}`}>{msg.time}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader size={14} className="animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Analizando datos...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="flex-shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Pregunta sobre planificación, backlog, prioridades..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-[#2E7D32] text-white rounded-xl hover:bg-[#1B5E20] disabled:opacity-50 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <AlertCircle size={10} /> Safety-first: Las recomendaciones de IA siempre requieren validación humana antes de ejecutar.
          </p>
        </div>
      </div>
    </div>
  );
}
