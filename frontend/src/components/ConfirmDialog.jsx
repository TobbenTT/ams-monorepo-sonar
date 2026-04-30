import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext();

export function useConfirm() {
    return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);

    // confirm(title, message)
    // confirm({ title, message, variant: 'danger'|'default', confirmText, cancelText, icon })
    const confirm = useCallback((titleOrOpts, message) => {
        return new Promise((resolve) => {
            const opts = typeof titleOrOpts === 'object' && titleOrOpts !== null
                ? titleOrOpts
                : { title: titleOrOpts, message };
            setState({ ...opts, resolve });
        });
    }, []);

    const handleClose = (result) => {
        state?.resolve(result);
        setState(null);
    };

    // Cerrar con Escape
    useEffect(() => {
        if (!state) return;
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose(false);
            if (e.key === 'Enter') handleClose(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [state]);

    const isDanger = state?.variant === 'danger';
    const confirmText = state?.confirmText || (isDanger ? 'Eliminar' : 'Confirmar');
    const cancelText = state?.cancelText || 'Cancelar';
    const Icon = state?.icon || (isDanger ? AlertTriangle : null);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div
                    className="fixed inset-0 z-[9998] flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-label={state.title}
                >
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
                        onClick={() => handleClose(false)}
                    />
                    <div
                        className="relative bg-white dark:bg-card rounded-2xl shadow-2xl border border-border max-w-[440px] w-[92%] overflow-hidden animate-in zoom-in-95 fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className={`h-1 ${isDanger ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`} />

                        {/* Close X */}
                        <button
                            onClick={() => handleClose(false)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                {Icon && (
                                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDanger ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-foreground leading-snug">{state.title}</h3>
                                    {state.message && (
                                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{state.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-muted transition-colors text-foreground"
                                    onClick={() => handleClose(false)}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors shadow-sm ${
                                        isDanger
                                            ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/30'
                                            : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/30'
                                    }`}
                                    onClick={() => handleClose(true)}
                                    autoFocus
                                >
                                    {confirmText}
                                </button>
                            </div>

                            <p className="text-[10px] text-muted-foreground mt-3 text-center italic">
                                Enter para confirmar · Esc para cancelar
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
