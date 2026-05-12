import { useEffect, useRef, useState } from 'react';
import { subscribe } from '../wsSingleton';

/**
 * WebSocket hook for real-time updates.
 * Backed by a singleton connection per plantId (see wsSingleton.js) — no matter
 * how many components call this hook, there is at most ONE physical WS per plant.
 * Auto-reconnects and pings every 15s.
 *
 * Bug audit 2026-05-12:
 *  - Antes `useEffect([plantId, onMessage])` resubscribía en cada render si el
 *    caller no usaba `useCallback`. Ahora el handler se mantiene en un ref
 *    interno → un único subscribe por plantId, independiente de re-renders.
 *  - `connected` ahora es estado real (escucha `ws:status` events) en vez de
 *    `true` constante.
 */
export function useWebSocket(plantId, onMessage) {
    // Handler ref: stable subscribe + handler siempre fresco al disparar.
    const handlerRef = useRef(onMessage);
    useEffect(() => { handlerRef.current = onMessage; }, [onMessage]);

    const [connected, setConnected] = useState(true);

    useEffect(() => {
        if (!plantId) return;
        const dispatch = (msg) => {
            try { handlerRef.current?.(msg); } catch { /* swallow handler errors */ }
        };
        const unsub = subscribe(plantId, dispatch);

        const onStatus = (e) => {
            if (e?.detail?.plantId === plantId) setConnected(!!e.detail.connected);
        };
        try { window.addEventListener('ws:status', onStatus); } catch {}

        return () => {
            unsub();
            try { window.removeEventListener('ws:status', onStatus); } catch {}
        };
    }, [plantId]);  // ← solo plantId. Handler vía ref, no re-subscribe.

    return { connected };
}

/**
 * Variante del hook con debounce/coalescing — útil cuando el handler dispara
 * un fetch costoso (Planning, Scheduling, etc). Múltiples WS events dentro
 * de la ventana `debounceMs` resultan en UN solo trigger.
 *
 * Bug audit 2026-05-12 (B6): páginas como Planning hacen fetchData() en
 * cada wo_* event. Si llegan 5 eventos en 200ms (caso típico: bulk update),
 * se disparan 5 fetches. Con esta variante se dispara 1.
 *
 * Uso:
 *   useWebSocketCoalesced(plant, fetchData, 250);
 *   // O con filtro por event prefix:
 *   useWebSocketCoalesced(plant, fetchData, 250, (msg) => msg.event?.startsWith('wo_'));
 */
export function useWebSocketCoalesced(plantId, callback, debounceMs = 200, filter = null) {
    const callbackRef = useRef(callback);
    const filterRef = useRef(filter);
    useEffect(() => { callbackRef.current = callback; }, [callback]);
    useEffect(() => { filterRef.current = filter; }, [filter]);

    const handler = useRef((msg) => {
        try {
            const f = filterRef.current;
            if (f && !f(msg)) return;
        } catch { return; }
        // Coalesce: solo un trigger por ventana de debounceMs
        if (handler.current._t) clearTimeout(handler.current._t);
        handler.current._t = setTimeout(() => {
            handler.current._t = null;
            try { callbackRef.current?.(); } catch { /* swallow */ }
        }, debounceMs);
    });

    return useWebSocket(plantId, handler.current);
}
