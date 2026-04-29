// Agentic Capabilities Dashboard — respuesta al pedido José/Magda 2026-04-29:
// "centrar el demo en lo agéntico, no en replicar SAP".
// Numera y destaca las 22 capacidades diferenciales, agrupadas por capa del flujo.
import { useNavigate } from 'react-router-dom';
import {
  Camera, Mic, Search, Brain, Zap, UserCheck, Calendar, Shield, X,
  Bell, CheckCircle, Package, Target, AlertTriangle, RefreshCw, BarChart3,
  TrendingUp, FileText, GitBranch, Database, Sparkles, ArrowRight,
} from 'lucide-react';

const CAPABILITIES = [
  // Capa 1: Captura inteligente
  { id: 1, layer: 1, name: 'Captura por foto + Vision AI', icon: Camera, status: 'live',
    differential: 'SAP exige texto manual estructurado', mageam: 'Foto → IA detecta TAG + falla',
    demo_route: '/failure-capture', demo_action: 'Cargar foto del defecto' },
  { id: 2, layer: 1, name: 'Captura por voz + transcripción', icon: Mic, status: 'live',
    differential: 'SAP no acepta voz', mageam: 'Mantenedor dicta y la IA estructura WR',
    demo_route: '/failure-capture', demo_action: 'Botón rojo grabar' },
  { id: 3, layer: 1, name: 'Search-as-you-type duplicate detection', icon: Search, status: 'live',
    differential: 'SAP detecta dups DESPUÉS de crear', mageam: 'Avisa MIENTRAS escribe',
    demo_route: '/failure-capture', demo_action: 'Escribir descripción ≥20 chars' },
  { id: 4, layer: 1, name: 'AI Classification automática', icon: Brain, status: 'live',
    differential: 'SAP clasifica manual', mageam: 'Failure_type + priority + impact + HH auto',
    demo_route: '/work-requests' },

  // Capa 2: Validación + planificación
  { id: 5, layer: 2, name: 'Aviso → OT PM03 express (1 click)', icon: Zap, status: 'live',
    differential: 'SAP requiere ~5 transacciones', mageam: '1 round-trip backend',
    demo_route: '/work-requests', demo_action: 'WR P1 → "Express → PM03"' },
  { id: 6, layer: 2, name: 'Smart Assignment IA con skills + HH', icon: UserCheck, status: 'live',
    differential: 'SAP no rankea recursos', mageam: 'Score 0-100 con breakdown',
    demo_route: '/supervisor-board', demo_action: 'Detalle OT → botón 🧠 IA' },
  { id: 7, layer: 2, name: 'Auto-Level capacity-aware wizard', icon: Calendar, status: 'live',
    differential: 'SAP no balancea automático', mageam: 'Nivela carga + diferimiento por eq apoyo',
    demo_route: '/scheduling', demo_action: 'Botón Auto-Level' },
  { id: 8, layer: 2, name: 'Regla bloqueo PM01/02 → falla', icon: Shield, status: 'live',
    differential: 'SAP permite reusar (contamina KPIs)', mageam: 'Rechaza con 409 + sugiere PM03',
    demo_route: '/planning', demo_action: 'Cambiar pri→P1 en PM01 → mensaje bloqueo' },
  { id: 9, layer: 2, name: 'Cancelación con tipología (absorción)', icon: X, status: 'live',
    differential: 'SAP cancela sin tipo', mageam: 'ABSORBED/NOT_NEEDED/OTHER + linkea PM03',
    demo_route: '/supervisor-board', demo_action: 'Cancelar OT → dropdown tipología' },

  // Capa 3: Ejecución
  { id: 10, layer: 3, name: 'Notif parcial multi-turno + Final auto', icon: Bell, status: 'live',
    differential: 'SAP requiere notif manual', mageam: 'WS toast cuando todas las ops 100%',
    demo_route: '/execution', demo_action: 'Notif parcial última op pendiente' },
  { id: 11, layer: 3, name: 'Validación supervisor pre-cierre (gates)', icon: CheckCircle, status: 'live',
    differential: 'SAP cierra sin gates', mageam: '4 checkboxes obligatorios pre-EN_EJECUCION',
    demo_route: '/execution' },
  { id: 12, layer: 3, name: 'Stock auto-decrement al cerrar OT', icon: Package, status: 'live',
    differential: 'SAP requiere mov 261 manual', mageam: 'Hook idempotente automático' },

  // Capa 4: Análisis IA
  { id: 13, layer: 4, name: 'Bad Actors × Equipos críticos', icon: Target, status: 'live',
    differential: 'SAP no cruza criticidad', mageam: 'Threshold reducido para A/B + ranking',
    demo_route: '/work-management', demo_action: 'Performance Analysis → Bad Actors' },
  { id: 14, layer: 4, name: 'Detección fallas crónicas IA', icon: AlertTriangle, status: 'live',
    differential: 'SAP no detecta patrones', mageam: '≥3 reps mismo modo en 7d → flag',
    demo_route: '/work-management' },
  { id: 15, layer: 4, name: 'Cluster + Auto-RCA trigger', icon: Sparkles, status: 'live',
    differential: 'SAP no abre RCAs solo', mageam: 'Crea RCA con 5W2H pre-llenado',
    demo_route: '/work-management', demo_action: 'PA → 🤖 Auto-generar RCAs' },
  { id: 16, layer: 4, name: 'Detector retrabajos <24h', icon: RefreshCw, status: 'live',
    differential: 'SAP no correlaciona temporal', mageam: 'Equipo intervenido vuelve a fallar <24h',
    demo_route: '/work-management' },
  { id: 17, layer: 4, name: 'Pareto + Jack-Knife auto', icon: BarChart3, status: 'live',
    differential: 'SAP no genera estos charts', mageam: '80/20 + 4 cuadrantes calculados',
    demo_route: '/work-management' },
  { id: 18, layer: 4, name: 'NLP causas no-cumplimiento', icon: FileText, status: 'live',
    differential: 'SAP no procesa texto libre', mageam: 'Lee notes y categoriza en 7 patrones',
    demo_route: '/work-management' },
  { id: 19, layer: 4, name: 'Stock forecast IA + sugerencia OC', icon: TrendingUp, status: 'live',
    differential: 'SAP MRP no integra demanda OTs futuras', mageam: 'Cobertura + risk + cantidad sugerida',
    demo_route: '/work-management' },
  { id: 20, layer: 4, name: 'Cost analysis drill-down con cost_element AI', icon: BarChart3, status: 'live',
    differential: 'SAP CO no clasifica automático', mageam: 'NLP descripción → 7 cost_elements + tree',
    demo_route: '/work-management' },

  // Capa 5: Cierre del ciclo
  { id: 21, layer: 5, name: 'DefectElimination → FMECA push auto', icon: GitBranch, status: 'live',
    differential: 'SAP no escribe FMECA al cerrar RCA', mageam: 'Registra modo + RPN before/after',
    demo_route: '/defect-elimination' },
  { id: 22, layer: 5, name: 'Close-the-loop tracking + warnings', icon: AlertTriangle, status: 'live',
    differential: 'SAP no rastrea ciclo mejora', mageam: 'Flags acciones vencidas = expuesto',
    demo_route: '/work-management' },

  // Capa 6: Phase 2
  { id: 23, layer: 6, name: 'SAP integración bidireccional', icon: Database, status: 'phase2',
    differential: 'Único conector que escribe IA hallazgos a SAP', mageam: 'Stub honest + queue persistente',
    demo_route: '/sap-pm', demo_action: 'Tab "Sync Bidireccional"' },
];

const LAYERS = {
  1: { name: 'Captura inteligente', color: 'bg-blue-50 border-blue-300 text-blue-900' },
  2: { name: 'Validación + Planificación', color: 'bg-purple-50 border-purple-300 text-purple-900' },
  3: { name: 'Ejecución inteligente', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
  4: { name: 'Análisis y diagnóstico (la joya)', color: 'bg-rose-50 border-rose-400 text-rose-900' },
  5: { name: 'Cierre del ciclo (close the loop)', color: 'bg-amber-50 border-amber-300 text-amber-900' },
  6: { name: 'Phase 2 — Integración SAP', color: 'bg-gray-50 border-gray-300 text-gray-700' },
};

const STATUS_BADGE = {
  live: { label: '✅ FUNCIONAL', cls: 'bg-emerald-600 text-white' },
  partial: { label: '🟡 PARCIAL', cls: 'bg-amber-500 text-white' },
  phase2: { label: '🔴 PHASE 2', cls: 'bg-gray-500 text-white' },
};

export default function AgenticCapabilities() {
  const navigate = useNavigate();
  const byLayer = {};
  CAPABILITIES.forEach(c => { (byLayer[c.layer] ||= []).push(c); });
  const liveCount = CAPABILITIES.filter(c => c.status === 'live').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-rose-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Capacidades Agénticas MAGEAM</h1>
          </div>
          <p className="text-emerald-100 text-base">
            <strong>{liveCount}</strong> capacidades diferenciales sobre SAP PM —
            esto es donde está el valor del proyecto, no en replicar transacciones SAP.
          </p>
          <p className="text-rose-100 text-xs mt-2 italic">
            Respuesta al planteo José Cortinat + Magdalena Ortega 2026-04-29:
            "el demo del jueves debe centrarse en estas partes auténticas, no en SAP-replication".
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{liveCount}</div>
            <div className="text-[10px] text-gray-500 uppercase">Funcionales</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{CAPABILITIES.filter(c => c.status === 'partial').length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Parciales</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{CAPABILITIES.filter(c => c.status === 'phase2').length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Phase 2</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">6</div>
            <div className="text-[10px] text-gray-500 uppercase">Capas</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-purple-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">177</div>
            <div className="text-[10px] text-gray-500 uppercase">Tests CI</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-rose-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-rose-600">15min</div>
            <div className="text-[10px] text-gray-500 uppercase">Demo flow</div>
          </div>
        </div>

        {/* Layers */}
        {Object.entries(byLayer).map(([layerId, caps]) => {
          const layer = LAYERS[layerId];
          return (
            <div key={layerId} className={`rounded-2xl border-2 p-5 ${layer.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Capa {layerId} — {layer.name}</h2>
                <span className="text-xs font-bold bg-white/70 px-2 py-1 rounded">
                  {caps.length} capacidad{caps.length > 1 ? 'es' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caps.map(c => {
                  const Icon = c.icon;
                  const sb = STATUS_BADGE[c.status];
                  return (
                    <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono font-bold text-gray-400">#{c.id}</span>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">{c.name}</h3>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sb.cls}`}>{sb.label}</span>
                          </div>
                          <div className="text-xs space-y-1 mt-2">
                            <p className="text-red-700">
                              <span className="font-bold">SAP:</span> {c.differential}
                            </p>
                            <p className="text-emerald-700">
                              <span className="font-bold">MAGEAM:</span> {c.mageam}
                            </p>
                          </div>
                          {c.demo_route && (
                            <button
                              onClick={() => navigate(c.demo_route)}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800">
                              Demo ahora <ArrowRight className="w-3 h-3" />
                              {c.demo_action && <span className="text-gray-500 ml-1">· {c.demo_action}</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer demo flow */}
        <div className="bg-gradient-to-r from-rose-600 to-emerald-600 text-white rounded-2xl p-5">
          <h3 className="text-base font-bold mb-3">📋 Flujo de demo recomendado (15 min, Jueves)</h3>
          <ol className="space-y-1.5 text-sm">
            <li><strong>1. Captura inteligente (3 min)</strong> — #1 foto + #2 voz + #3 search-as-you-type dup</li>
            <li><strong>2. Express + Smart Assign (3 min)</strong> — #5 WR→PM03 1 click + #6 ranking IA top candidato</li>
            <li><strong>3. Ejecución inteligente (2 min)</strong> — #10 notif parcial → toast FINAL automática</li>
            <li><strong>4. Detección IA (4 min)</strong> — #13 Bad Actors críticos + #15 Auto-RCA cluster + #16 retrabajos</li>
            <li><strong>5. Forecast + Costos IA (2 min)</strong> — #19 stock forecast + #20 drill-down costos</li>
            <li><strong>6. Close-the-loop (1 min)</strong> — #21 DefectElimination→FMECA + #22 warnings vencidas</li>
          </ol>
          <p className="text-xs mt-3 opacity-90 italic">
            ⚠ NO mostrar SapPmPage tabs (replica SAP, no diferencial). Si Jorge pregunta:
            "esto es 1:1 con SAP, lo importante está en Performance Analysis".
          </p>
        </div>
      </div>
    </div>
  );
}
