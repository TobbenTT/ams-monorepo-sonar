import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export function useConfirm() {
    return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);

    const confirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setState({ title, message, resolve });
        });
    }, []);

    const handleClose = (result) => {
        state?.resolve(result);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div
                    className="fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center animate-in fade-in"
                    onClick={() => handleClose(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={state.title}
                >
                    <div
                        className="bg-card rounded-xl p-6 max-w-[400px] w-[90%] shadow-2xl border border-border animate-in zoom-in-95"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-2">{state.title}</h3>
                        <p className="text-sm text-muted-foreground mb-5">{state.message}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                                onClick={() => handleClose(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                onClick={() => handleClose(true)}
                                autoFocus
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
