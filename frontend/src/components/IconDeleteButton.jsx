import { X } from 'lucide-react';

/**
 * Botón de eliminar uniforme con touch target mínimo 24×24px.
 *
 * SF-604 BUG-13 (jornada VSC 2026-05-08): los botones "✕" "x" sueltos en
 * el modal OT eran de 9×9px — abajo del minimum táctil + difícil click
 * + mal alineados. Este componente uniforma todos.
 *
 * Uso:
 *   <IconDeleteButton onClick={fn} title="Eliminar material" />
 *   <IconDeleteButton onClick={fn} title="..." size="sm" />  // 20×20
 *   <IconDeleteButton onClick={fn} title="..." size="lg" />  // 32×32
 */
export default function IconDeleteButton({
  onClick,
  title = 'Eliminar',
  size = 'md',
  disabled = false,
  className = '',
}) {
  const dims = {
    sm: { box: 'w-5 h-5', icon: 12 },
    md: { box: 'w-6 h-6', icon: 14 },
    lg: { box: 'w-8 h-8', icon: 16 },
  }[size] || { box: 'w-6 h-6', icon: 14 };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center ${dims.box} rounded-md text-red-500 hover:text-white hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <X size={dims.icon} strokeWidth={2.5} />
    </button>
  );
}
