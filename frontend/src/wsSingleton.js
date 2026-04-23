/**
 * Singleton WebSocket connection per plant.
 *
 * - Un WS físico por plantId, compartido vía pub/sub.
 * - client_id en sessionStorage → server etiqueta broadcasts para echo suppression.
 * - user_id → presence tracking (shared-account detection).
 *
 * Audit 2026-04-22 — bugs fixed:
 * 1. Connection leak: al quedarse sin subscribers la conexión seguía abierta.
 * 2. Laptop sleep/wake: el browser no detecta el WS muerto hasta que intenta send.
 *    Ahora: visibilitychange → force reconnect si el WS está muerto.
 * 3. Ping timeout: si no hay pong en 10s, tratar como dead.
 * 4. Online/offline: reconectar inmediato cuando la red vuelve.
 */

const connections = new Map();

function getClientId() {
    try {
        let id = sessionStorage.getItem('ws_client_id');
        if (!id) {
            id = 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
            sessionStorage.setItem('ws_client_id', id);
        }
        return id;
    } catch {
        return 'c_' + Math.random().toString(36).slice(2, 10);
    }
}

function getUserId() {
    try {
        const raw = localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (!raw) return '';
        const u = JSON.parse(raw);
        return String(u?.id ?? u?.user_id ?? u?.username ?? '');
    } catch {
        return '';
    }
}

export const CLIENT_ID = getClientId();

function buildUrl(plantId) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const params = new URLSearchParams({ client_id: CLIENT_ID });
    const uid = getUserId();
    if (uid) params.set('user_id', uid);
    return `${proto}//${window.location.host}/ws/${plantId}?${params.toString()}`;
}

function openConnection(plantId) {
    const state = {
        ws: null,
        subscribers: new Set(),
        reconnectTimer: null,
        pingInterval: null,
        pongTimer: null,      // timeout de espera de pong
        closed: false,
        retryAttempt: 0,
        connected: false,
        lastPongAt: 0,
    };

    const notifyStatus = (connected) => {
        const prev = state.connected;
        state.connected = connected;
        if (!connected) state.retryAttempt++;
        else state.retryAttempt = 0;
        if (prev === connected) return;   // no disparar si no cambió
        try {
            window.dispatchEvent(new CustomEvent('ws:status', {
                detail: { plantId, connected, attempt: state.retryAttempt },
            }));
        } catch {}
    };

    const clearTimers = () => {
        if (state.pingInterval) { clearInterval(state.pingInterval); state.pingInterval = null; }
        if (state.pongTimer)    { clearTimeout(state.pongTimer); state.pongTimer = null; }
    };

    const forceClose = () => {
        // Fuerza el cierre del WS actual; onclose dispara reconnect.
        if (state.ws) {
            try { state.ws.onclose = null; state.ws.onerror = null; state.ws.onmessage = null; state.ws.close(); } catch {}
            state.ws = null;
        }
        clearTimers();
        if (state.connected) notifyStatus(false);
        if (!state.closed) scheduleReconnect(0);
    };

    const sendPing = (ws) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        try { ws.send('ping'); } catch { return forceClose(); }
        // Si no recibimos pong en 10s, consideramos el WS muerto (laptop sleep,
        // NAT timeout, proxy cierre, red intermitente).
        if (state.pongTimer) clearTimeout(state.pongTimer);
        state.pongTimer = setTimeout(() => {
            if (Date.now() - state.lastPongAt > 10000) {
                forceClose();
            }
        }, 10000);
    };

    const connect = () => {
        if (state.closed) return;
        let ws;
        try { ws = new WebSocket(buildUrl(plantId)); } catch { return scheduleReconnect(); }
        state.ws = ws;

        ws.onopen = () => {
            state.lastPongAt = Date.now();
            notifyStatus(true);
            // ping cada 25s + espera pong ≤10s
            state.pingInterval = setInterval(() => sendPing(ws), 25000);
        };

        ws.onmessage = (evt) => {
            state.lastPongAt = Date.now();
            if (state.pongTimer) { clearTimeout(state.pongTimer); state.pongTimer = null; }
            if (evt.data === 'pong') return;
            let msg;
            try { msg = JSON.parse(evt.data); } catch { return; }
            // force_logout / server_restart → cerrar sesión y redirect inmediato.
            if (msg?.event === 'server_restart' || msg?.event === 'force_logout') {
                const reason = encodeURIComponent(msg?.data?.message || 'Sesión cerrada por el servidor. Volvé a iniciar sesión.');
                try {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('ws_client_id');
                } catch {}
                try {
                    fetch('/api/v1/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        keepalive: true,
                    }).catch(() => {});
                } catch {}
                try { window.location.replace(`/login?notice=${reason}`); } catch {
                    try { window.location.href = `/login?notice=${reason}`; } catch {}
                }
                return;
            }
            // Echo suppression
            if (msg && msg.origin_client_id && msg.origin_client_id === CLIENT_ID) return;
            const subs = Array.from(state.subscribers);
            for (const fn of subs) {
                try { fn(msg); } catch {}
            }
        };

        ws.onclose = () => {
            clearTimers();
            if (state.connected) notifyStatus(false);
            if (!state.closed) scheduleReconnect();
        };

        ws.onerror = () => { try { ws.close(); } catch {} };
    };

    const scheduleReconnect = (overrideDelay) => {
        if (state.closed || state.reconnectTimer) return;
        // Jorge 2026-04-23: Backoff más agresivo al inicio — usuario notaba que
        // tenía que recargar. Primer reintento a 500ms, luego 1s, 2s, 4s, 8s...
        // hasta 30s máximo. Así el reconnect es invisible para el usuario.
        const delay = overrideDelay != null
            ? overrideDelay
            : Math.min(30000, 500 * Math.pow(2, Math.min(state.retryAttempt, 6)));
        state.reconnectTimer = setTimeout(() => {
            state.reconnectTimer = null;
            connect();
        }, delay);
    };

    state.connect = connect;
    state.forceClose = forceClose;
    state.close = () => {
        state.closed = true;
        if (state.reconnectTimer) { clearTimeout(state.reconnectTimer); state.reconnectTimer = null; }
        clearTimers();
        try { state.ws?.close(); } catch {}
        state.subscribers.clear();
    };

    connect();
    return state;
}

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
        // Si no quedan subscribers, cerrar la conexión para liberar recursos.
        // Un nuevo subscribe() reabrirá limpiamente.
        if (state.subscribers.size === 0) {
            // Debounce 3s por si el usuario sólo está navegando entre páginas que
            // comparten el mismo plant — evita flap open/close.
            setTimeout(() => {
                if (state.subscribers.size === 0 && !state.closed) {
                    state.close();
                    connections.delete(plantId);
                }
            }, 3000);
        }
    };
}

export function closeConnection(plantId) {
    const state = connections.get(plantId);
    if (!state) return;
    state.close();
    connections.delete(plantId);
}

export function closeAllConnections() {
    for (const [plantId] of connections) closeConnection(plantId);
}

// ── Hooks globales: recuperar conexión tras sleep/wake, network switch ─
// Sin esto, el browser mantiene el WS "abierto" pero el servidor ya no responde.
// Los síntomas: laptop vuelve del sleep y el WS parece vivo pero no recibe eventos.
try {
    window.addEventListener('online', () => {
        for (const [, state] of connections) {
            if (!state.closed && !state.connected) state.forceClose?.();
        }
    });
    window.addEventListener('offline', () => {
        for (const [, state] of connections) {
            if (!state.closed && state.connected) state.forceClose?.();
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        // Al volver a primer plano, verificar heartbeat: si no hubo pong reciente
        // (>60s), el WS está muerto aunque el readyState diga OPEN.
        const now = Date.now();
        for (const [, state] of connections) {
            if (state.closed) continue;
            if (!state.connected || (state.lastPongAt && now - state.lastPongAt > 60000)) {
                state.forceClose?.();
            }
        }
    });
} catch {}
