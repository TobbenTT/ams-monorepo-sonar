import { useState } from "react";
import { ChevronRight, ChevronDown, Factory, Building2, Layers, Wrench, Cpu, Search } from "lucide-react";
import { HIERARCHY_TREE, EQUIPMENT_LIST, criticalityColor, statusColor } from "../data/mockData";

const TYPE_ICONS: Record<string, any> = {
  Company: Factory,
  Plant: Building2,
  Area: Layers,
  Equipment: Wrench,
  Component: Cpu,
};
const TYPE_COLORS: Record<string, string> = {
  Company: "text-gray-700 bg-gray-100",
  Plant: "text-green-700 bg-green-50",
  Area: "text-blue-700 bg-blue-50",
  Equipment: "text-amber-700 bg-amber-50",
  Component: "text-purple-700 bg-purple-50",
};

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const Icon = TYPE_ICONS[node.type] ?? Wrench;
  const hasChildren = node.children && node.children.length > 0;
  const eq = EQUIPMENT_LIST.find(e => e.tag === node.id);

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group ${depth === 0 ? "bg-gray-50" : ""}`}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-shrink-0">
          {hasChildren ? (
            open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
          ) : <div className="w-3.5" />}
        </div>
        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[node.type]}`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold truncate ${depth === 0 ? "text-base text-gray-900" : depth === 1 ? "text-sm text-gray-800" : "text-xs text-gray-700"}`}>
              {node.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[node.type]}`}>{node.type}</span>
            {eq && (
              <>
                <span className={`text-xs px-1.5 py-0.5 rounded-full border font-bold ${criticalityColor(eq.criticality)}`}>{eq.criticality}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColor(eq.status)}`}>{eq.status}</span>
              </>
            )}
          </div>
          {node.id !== node.name && <span className="text-xs text-gray-400 font-mono">{node.id}</span>}
        </div>
      </div>
      {open && hasChildren && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Hierarchy() {
  const [search, setSearch] = useState("");

  const criticalEquip = EQUIPMENT_LIST.filter(e => e.criticality === "AA");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">🌳 Jerarquía de Activos</h1>
        <p className="text-sm text-gray-500">Estructura: Planta → Área → Sistema → Equipo → Componente</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Plantas", value: 3, color: "bg-green-50 text-green-700" },
          { label: "Áreas", value: 7, color: "bg-blue-50 text-blue-700" },
          { label: "Equipos", value: EQUIPMENT_LIST.length, color: "bg-amber-50 text-amber-700" },
          { label: "Críticos AA", value: criticalEquip.length, color: "bg-red-50 text-red-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border border-gray-200 p-4 text-center ${color} bg-opacity-50`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Árbol de Equipos</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar TAG..." className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-40" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            <TreeNode node={HIERARCHY_TREE} depth={0} />
          </div>
        </div>

        {/* Criticality Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Equipos por Criticidad</h3>
            <div className="space-y-2">
              {[
                { level: "AA", label: "Clase AA (Crítico)", color: "bg-red-500", count: EQUIPMENT_LIST.filter(e => e.criticality === "AA").length },
                { level: "A+", label: "Clase A+ (Alto)", color: "bg-orange-400", count: EQUIPMENT_LIST.filter(e => e.criticality === "A+").length },
                { level: "A", label: "Clase A (Importante)", color: "bg-yellow-400", count: EQUIPMENT_LIST.filter(e => e.criticality === "A").length },
                { level: "B", label: "Clase B (Moderado)", color: "bg-blue-400", count: EQUIPMENT_LIST.filter(e => e.criticality === "B").length },
              ].map(({ level, label, color, count }) => (
                <div key={level} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-xs text-gray-700 flex-1">{label}</span>
                  <span className="text-xs font-bold text-gray-900 bg-gray-100 rounded px-2 py-0.5">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Equipment List */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Equipos AA — Clase Máxima</h3>
            <div className="space-y-2">
              {criticalEquip.map(eq => (
                <div key={eq.tag} className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-800">{eq.tag}</p>
                  <p className="text-xs text-gray-600">{eq.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{eq.plant} · {eq.area}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${statusColor(eq.status)}`}>{eq.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type Legend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide">Leyenda de Tipos</h3>
            <div className="space-y-1.5">
              {Object.entries(TYPE_ICONS).map(([type, Icon]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${TYPE_COLORS[type]}`}><Icon size={10} /></div>
                  <span className="text-xs text-gray-700">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
