import { useEffect } from 'react';
import { subscribe } from '../wsSingleton';

/**
 * WebSocket hook for real-time updates.
 * Backed by a singleton connection per plantId (see wsSingleton.js) — no matter
 * how many components call this hook, there is at most ONE physical WS per plant.
 * Auto-reconnects and pings every 25s.
 */
export function useWebSocket(plantId, onMessage) {
    useEffect(() => {
        if (!plantId) return;
        const unsub = subscribe(plantId, onMessage);
        return unsub;
    }, [plantId, onMessage]);

    return { connected: true };
}
