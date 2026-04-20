/**
 * Singleton WebSocket connection per plant.
 *
 * Problem: WorkManagement.jsx keeps 5 tabs mounted (display:none) so the
 * previous per-component useWebSocket was spawning 5+ WS connections per user.
 * That floods the backend and triggers reconnect loops.
 *
 * Solution: one connection per plantId, shared by all subscribers via pub/sub.
 * The WS closes only when plantId changes (or full tab close).
 */

const connections = new Map(); // plantId -> { ws, subscribers:Set<fn>, reconnectTimer, pingInterval }

function buildUrl(plantId) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws/${plantId}`;
}

function openConnection(plantId) {
    const state = {
        ws: null,
        subscribers: new Set(),
        reconnectTimer: null,
        pingInterval: null,
        closed: false,
    };

    const connect = () => {
        if (state.closed) return;
        let ws;
        try { ws = new WebSocket(buildUrl(plantId)); } catch { return scheduleReconnect(); }
        state.ws = ws;

        ws.onopen = () => {
            state.pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send('ping');
            }, 25000);
        };

        ws.onmessage = (evt) => {
            if (evt.data === 'pong') return;
            let msg;
            try { msg = JSON.parse(evt.data); } catch { return; }
            // Snapshot subscribers so a handler that unsubscribes mid-loop doesn't break iteration
            const subs = Array.from(state.subscribers);
            for (const fn of subs) {
                try { fn(msg); } catch { /* handler errors shouldn't kill the socket */ }
            }
        };

        ws.onclose = () => {
            if (state.pingInterval) { clearInterval(state.pingInterval); state.pingInterval = null; }
            if (!state.closed) scheduleReconnect();
        };

        ws.onerror = () => { try { ws.close(); } catch {} };
    };

    const scheduleReconnect = () => {
        if (state.closed || state.reconnectTimer) return;
        state.reconnectTimer = setTimeout(() => {
            state.reconnectTimer = null;
            connect();
        }, 3000);
    };

    state.connect = connect;
    state.close = () => {
        state.closed = true;
        if (state.reconnectTimer) { clearTimeout(state.reconnectTimer); state.reconnectTimer = null; }
        if (state.pingInterval) { clearInterval(state.pingInterval); state.pingInterval = null; }
        try { state.ws?.close(); } catch {}
        state.subscribers.clear();
    };

    connect();
    return state;
}

/** Subscribe to WS messages for a plant. Returns an unsubscribe fn. */
export function subscribe(plantId, onMessage) {
    if (!plantId || typeof onMessage !== 'function') return () => { };
    let state = connections.get(plantId);
    if (!state) {
        state = openConnection(plantId);
        connections.set(plantId, state);
    }
    state.subscribers.add(onMessage);
    return () => {
        state.subscribers.delete(onMessage);
        // We intentionally DON'T close the socket when subscribers drop to 0;
        // pages mount/unmount all the time and reconnect churn is worse than an idle socket.
    };
}

/** Close a plant's connection (e.g., on plant change or logout). */
export function closeConnection(plantId) {
    const state = connections.get(plantId);
    if (!state) return;
    state.close();
    connections.delete(plantId);
}

/** Close all connections (logout, unload). */
export function closeAllConnections() {
    for (const [plantId] of connections) closeConnection(plantId);
}
