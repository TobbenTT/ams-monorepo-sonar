import { useState, useEffect, useRef } from 'react';

/**
 * ProgressEditor — input de avance con state local. Antes el input controlado
 * llamaba handleProgress en cada keystroke (race conditions: tipear "100"
 * disparaba 1, 10, 100 y el response del backend ganaba en orden impredecible
 * dejando valores intermedios visibles). Ahora: estado local mientras se tipea,
 * commit en blur o Enter. Botones rápidos (-/+/25/50/75/100) commitean directo.
 *
 * Extraído de Execution.jsx en refactor 2026-05-12.
 */
export default function ProgressEditor({ wo, pct, onSave }) {
  const [local, setLocal] = useState(String(pct));
  const lastPropPct = useRef(pct);
  // Si el pct prop cambia (ej. desde otra interacción o WS), sincronizar — pero
  // solo si el usuario no está editando (input no enfocado).
  useEffect(() => {
    if (lastPropPct.current !== pct) {
      lastPropPct.current = pct;
      setLocal(String(pct));
    }
  }, [pct]);
  const commit = (raw) => {
    const v = Math.max(0, Math.min(100, parseInt(raw, 10) || 0));
    setLocal(String(v));
    if (v !== pct) onSave(wo, v);
  };
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase">avance</span>
      <button onClick={() => { const v = Math.max(0, pct - 5); setLocal(String(v)); onSave(wo, v); }}
        title="-5%" className="px-1.5 text-xs hover:bg-muted rounded">−</button>
      <input type="number" min="0" max="100" step="5" value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
        className="w-12 text-xs font-bold text-center bg-transparent border border-border rounded px-1 py-0.5" />
      <span className="text-xs font-bold">%</span>
      <button onClick={() => { const v = Math.min(100, pct + 5); setLocal(String(v)); onSave(wo, v); }}
        title="+5%" className="px-1.5 text-xs hover:bg-muted rounded">+</button>
      <span className="border-l border-border h-4 mx-0.5" />
      {[25, 50, 75, 100].map(p => (
        <button key={p} onClick={() => { setLocal(String(p)); onSave(wo, p); }}
          title={`Set ${p}%`}
          className={`px-2 text-[10px] font-bold rounded ${pct === p ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
          {p}
        </button>
      ))}
    </div>
  );
}
