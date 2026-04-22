import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, Search, AlertTriangle, Loader2, Filter, TrendingDown } from 'lucide-react';
import * as api from '../api';

const STATUS_COLOR = {
  OK:  'bg-emerald-100 text-emerald-700 border-emerald-300',
  LOW: 'bg-amber-100 text-amber-700 border-amber-300',
  OUT: 'bg-red-100 text-red-700 border-red-300',
};

export default function SpareParts() {
  const { plant } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.listInventory({ plant_id: plant })
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [plant]);

  const enriched = useMemo(() => {
    return items.map(x => {
      const inStock = Number(x.in_stock ?? x.quantity_on_hand ?? 0);
      const reserved = Number(x.reserved ?? x.quantity_reserved ?? 0);
      const available = Number(x.available ?? x.quantity_available ?? Math.max(0, inStock - reserved));
      const minStock = Number(x.min_stock ?? 0);
      const reorderPoint = Number(x.reorder_point ?? 0);
      const status = x.status || (available <= 0 ? 'OUT' : (inStock <= minStock ? 'LOW' : 'OK'));
      return { ...x, inStock, reserved, available, minStock, reorderPoint, status };
    });
  }, [items]);

  const filtered = useMemo(() => {
    return enriched.filter(x => {
      if (onlyLow && x.status === 'OK') return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (x.material_code || '').toLowerCase().includes(q)
        || (x.description || '').toLowerCase().includes(q);
    });
  }, [enriched, search, onlyLow]);

  const totals = useMemo(() => {
    const out = enriched.filter(x => x.status === 'OUT').length;
    const low = enriched.filter(x => x.status === 'LOW').length;
    const ok  = enriched.filter(x => x.status === 'OK').length;
    return { total: enriched.length, out, low, ok };
  }, [enriched]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
            <Package size={22} className="text-cyan-700 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Spare Parts / Inventario</h1>
            <p className="text-sm text-muted-foreground">Materiales SAP · stock y reservas</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total SKUs" value={totals.total} tone="gray" />
        <SummaryCard label="En stock OK" value={totals.ok} tone="emerald" />
        <SummaryCard label="Bajo mínimo" value={totals.low} tone="amber" />
        <SummaryCard label="Quebrado" value={totals.out} tone="red" />
      </div>

      {/* Alerts strip */}
      {totals.out > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <span className="text-sm font-bold text-red-800">
            {totals.out} materiales sin stock — revisar reposición
          </span>
          <button onClick={() => setOnlyLow(true)} className="ml-auto text-xs font-semibold text-red-700 underline">Filtrar</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código SAP o descripción…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-cyan-300" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={onlyLow} onChange={e => setOnlyLow(e.target.checked)} />
          <Filter size={14} /> Solo bajo mínimo / quebrado
        </label>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
                {['Código SAP', 'Descripción', 'Stock', 'Reservado', 'Disponible', 'Min', 'Reorder', 'Estado'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-3 py-10 text-center">
                  <Loader2 size={18} className="animate-spin inline text-gray-400" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground italic">
                  {search || onlyLow ? 'Sin resultados para los filtros.' : 'Sin inventario cargado.'}
                </td></tr>
              ) : filtered.slice(0, 200).map(x => (
                <tr key={x.material_code} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-3 py-2 font-mono text-xs">{x.material_code}</td>
                  <td className="px-3 py-2 text-xs">{x.description || '—'}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{x.inStock}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">{x.reserved}</td>
                  <td className="px-3 py-2 text-center font-semibold tabular-nums">{x.available}</td>
                  <td className="px-3 py-2 text-center text-xs text-muted-foreground tabular-nums">{x.minStock}</td>
                  <td className="px-3 py-2 text-center text-xs text-muted-foreground tabular-nums">{x.reorderPoint}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLOR[x.status] || STATUS_COLOR.OK}`}>
                      {x.status === 'OUT' ? 'Quebrado' : x.status === 'LOW' ? 'Bajo mín' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <div className="px-3 py-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/30">
            Mostrando 200 de {filtered.length}. Refina la búsqueda para ver más.
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone = 'gray' }) {
  const tones = {
    gray:    'bg-gray-50 text-gray-800 border-gray-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber:   'bg-amber-50 text-amber-800 border-amber-200',
    red:     'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
