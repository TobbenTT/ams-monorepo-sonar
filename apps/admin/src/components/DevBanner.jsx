import { Wrench } from 'lucide-react';

/**
 * Jorge 2026-04-23: banner "En desarrollo" para features que están parcialmente
 * implementadas o en construcción. Da visibilidad honesta al stakeholder sin
 * bloquear la navegación al contenido real debajo.
 *
 * Uso:
 *   <DevBanner>La vista consolidada de Adherencia está en construcción.</DevBanner>
 *   <DevBanner variant="subtle" icon={false}>Datos parciales — pipeline incompleto</DevBanner>
 */
export default function DevBanner({ children, variant = 'default', icon = true, className = '' }) {
  const styles = {
    default: 'bg-amber-50 border-amber-300 text-amber-800',
    subtle: 'bg-gray-50 border-gray-200 text-gray-600',
    strong: 'bg-amber-100 border-amber-400 text-amber-900',
  }[variant] || 'bg-amber-50 border-amber-300 text-amber-800';

  return (
    <div className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 text-xs ${styles} ${className}`}>
      {icon && <Wrench size={14} className="shrink-0" />}
      <span className="font-bold uppercase tracking-wider">En desarrollo</span>
      <span className="opacity-90">·</span>
      <span>{children}</span>
    </div>
  );
}
