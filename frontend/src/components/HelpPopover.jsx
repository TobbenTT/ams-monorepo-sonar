import { useState, useEffect, useRef } from 'react';

/**
 * HelpPopover — tooltip estilizado al click.
 *
 * Reemplaza el `title` HTML nativo (delay 1s, sin estilos, no respeta dark mode)
 * con un popover styled que se abre al click/hover. Cierra con click afuera o Escape.
 *
 * Props:
 *  - label: string — título del popover (en bold) y aria-label del trigger
 *  - text: string — cuerpo (acepta `\n` para saltos de línea)
 *  - variant: 'gray' | 'emerald' | 'purple' | 'rose' — color del trigger
 *  - size: 'xs' (3.5) | 'sm' (4 — default) | 'md' (5)
 *  - placement: 'right' | 'left' | 'center' — alineación del popover
 *  - className — extra classes para el span container
 */
export default function HelpPopover({
    label,
    text,
    variant = 'gray',
    size = 'sm',
    placement = 'right',
    className = '',
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        // Bug Gonzalo 2026-05-08: el "click outside" cerraba el popover cuando
        // el usuario clikeaba la scrollbar horizontal del modal padre (que el
        // popover tapaba parcialmente). Removido: el popover ahora SOLO se
        // cierra con Escape o el boton X. El usuario puede interactuar con
        // cualquier control debajo sin que el tooltip desaparezca.
        const onKey = e => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('keydown', onKey); };
    }, [open]);

    const trigVariant = {
        gray: 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
        emerald: 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300 dark:bg-emerald-800 dark:text-emerald-200',
        purple: 'bg-purple-200 text-purple-800 hover:bg-purple-300 dark:bg-purple-800 dark:text-purple-200',
        rose: 'bg-rose-200 text-rose-800 hover:bg-rose-300 dark:bg-rose-800 dark:text-rose-200',
    }[variant] || trigVariant.gray;

    const sizeClass = {
        xs: 'w-3.5 h-3.5 text-[9px]',
        sm: 'w-4 h-4 text-[10px]',
        md: 'w-5 h-5 text-[11px]',
    }[size] || 'w-4 h-4 text-[10px]';

    const placementClass = {
        right: 'right-0',
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
    }[placement] || 'right-0';

    return (
        <span ref={ref} className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
                className={`inline-flex items-center justify-center rounded-full font-bold cursor-pointer transition-colors ${sizeClass} ${trigVariant}`}
                aria-label={label || 'Ayuda'}
            >
                ?
            </button>
            {open && (
                // Una vez abierto, queda sticky hasta click afuera o Escape.
                // Sin onMouseLeave porque el popover puede tapar parcialmente
                // otros controles (scrollbar, inputs) y al mover el cursor para
                // interactuar el tooltip se cerraba — frustante (Gonzalo demo
                // 2026-05-08).
                <div
                    className={`absolute z-[60] ${placementClass} mt-1.5 w-[300px] max-w-[88vw] bg-white dark:bg-gray-900 border border-border rounded-xl shadow-2xl p-3 pt-3.5 text-xs leading-relaxed whitespace-pre-line animate-in fade-in zoom-in-95`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close X — útil cuando el popover bloquea otros controles */}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-base leading-none"
                        aria-label="Cerrar"
                    >×</button>
                    {/* Top accent */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${
                        variant === 'emerald' ? 'bg-emerald-500' :
                        variant === 'purple' ? 'bg-purple-500' :
                        variant === 'rose' ? 'bg-rose-500' :
                        'bg-gray-400'
                    }`} />
                    {label && (
                        <div className="font-bold mb-1.5 pr-5 text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                variant === 'emerald' ? 'bg-emerald-500' :
                                variant === 'purple' ? 'bg-purple-500' :
                                variant === 'rose' ? 'bg-rose-500' :
                                'bg-gray-400'
                            }`} />
                            <span className="truncate">{label}</span>
                        </div>
                    )}
                    <div className="text-gray-600 dark:text-gray-300">{text}</div>
                </div>
            )}
        </span>
    );
}
