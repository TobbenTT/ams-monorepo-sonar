import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from './ui/utils';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

const TOAST_STYLES = {
    success: 'border-l-green-600',
    error: 'border-l-red-600',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-600',
};

const ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration ?? 4000),
        error: (msg, duration) => addToast(msg, 'error', duration ?? 6000),
        warning: (msg, duration) => addToast(msg, 'warning', duration ?? 4000),
        info: (msg, duration) => addToast(msg, 'info', duration ?? 4000),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg bg-card shadow-lg border-l-4 text-sm min-w-[280px] max-w-[420px] animate-in slide-in-from-right-5 border border-border",
                            TOAST_STYLES[t.type]
                        )}
                    >
                        <span>{ICONS[t.type]}</span>
                        <span className="flex-1 text-foreground">{t.message}</span>
                        <button
                            className="text-muted-foreground hover:text-foreground text-lg leading-none p-0.5"
                            onClick={() => removeToast(t.id)}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
