/**
 * Auto-clasifica las observaciones del cierre en 3 buckets:
 * Repuestos · Oportunidad estrategia · Oportunidad procesos.
 * Heurística simple keyword — cuando metamos un agente dedicado el clasificador se reemplaza.
 *
 * Extraído de Execution.jsx en refactor 2026-05-12.
 */
export default function ClosureClassify({ notes }) {
  if (!notes || notes.length < 20) return null;
  const low = notes.toLowerCase();
  const repuestos = /(repuesto|pieza|stock|codigo|código|sap|bodega|material|filtro|rodamiento|sello|junta|correa)/.test(low);
  const estrategia = /(estrategia|frecuencia|preventivo|plan|intervalo|ciclo|predictivo|vibraci|termograf)/.test(low);
  const procesos = /(procedimiento|proceso|lockout|seguridad|permiso|herramienta|accesorio|traslad|tiempo)/.test(low);
  const tags = [];
  if (repuestos) tags.push({ k: 'Repuestos', c: 'bg-sky-100 text-sky-800' });
  if (estrategia) tags.push({ k: 'Oport. estrategia', c: 'bg-purple-100 text-purple-800' });
  if (procesos) tags.push({ k: 'Oport. procesos', c: 'bg-amber-100 text-amber-800' });
  if (tags.length === 0) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
      <span className="text-[9px] font-semibold uppercase text-muted-foreground">Clasificado:</span>
      {tags.map(t => <span key={t.k} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.c}`}>{t.k}</span>)}
    </div>
  );
}
