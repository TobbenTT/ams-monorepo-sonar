/**
 * Singleton WebSocket connection per plant.
 *
 * - One physical WS per plantId, shared by subscribers via pub/sub.
 * - Each browser tab has a stable `client_id` kept in sessionStorage.
 *   The server tags every broadcast with `origin_client_id` so we can
 *   drop our own echo (prevents edit-in-progress from being clobbered
 *   by its own write when two tabs share the same account).
 * - `user_id` is sent so the server can detect shared-account sessions
 *   and emit a `presence.shared_account` event.
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
        closed: false,
        retryAttempt: 0,    // contador para backoff exponencial
        connected: false,   // estado actual para UI
    };

    const notifyStatus = (connected) => {
        state.connected = connected;
        if (!connected) state.retryAttempt++;
        else state.retryAttempt = 0;
        // Disparar evento custom para que componentes UI puedan suscribirse
        try {
            window.dispatchEvent(new CustomEvent('ws:status', {
                detail: { plantId, connected, attempt: state.retryAttempt },
            }));
        } catch {}
    };

    const connect = () => {
        if (state.closed) return;
        let ws;
        try { ws = new WebSocket(buildUrl(plantId)); } catch { return scheduleReconnect(); }
        state.ws = ws;

        ws.onopen = () => {
            notifyStatus(true);
            state.pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send('ping');
            }, 25000);
        };

        ws.onmessage = (evt) => {
            if (evt.data === 'pong') return;
            let msg;
            try { msg = JSON.parse(evt.data); } catch { return; }
            // Jorge 2026-04-21 — si el servidor anuncia un restart/deploy,
            // limpiamos sesión (cookies HttpOnly via /auth/logout + localStorage)
            // y redirigimos a login. Evita stale cookies que sobreviven al deploy.
            if (msg?.event === 'server_restart' || msg?.event === 'force_logout') {
                const message = msg?.data?.message || 'Servidor reiniciando. Volvé a iniciar sesión en unos segundos.';
                const doRedirect = () => { try { window.location.href = '/login'; } catch {} };
                // Limpiar localStorage primero (sincrónico).
                try {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('ws_client_id');
                } catch {}
                // Pegar POST /auth/logout para borrar las cookies HttpOnly.
                // fetch con credentials para que el navegador envíe y reciba Set-Cookie.
                try {
                    fetch('/api/v1/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    })
                        .catch(() => {})
                        .finally(() => { alert(message); doRedirect(); });
                } catch {
                    alert(message);
                    doRedirect();
                }
                return;
            }
            // Echo suppression: if this event was caused by THIS tab's own mutation,
            // skip it — our local state is already updated optimistically.
            if (msg && msg.origin_client_id && msg.origin_client_id === CLIENT_ID) return;
            const subs = Array.from(state.subscribers);
            for (const fn of subs) {
                try { fn(msg); } catch { /* handler errors shouldn't kill the socket */ }
            }
        };

        ws.onclose = () => {
            if (state.pingInterval) { clearInterval(state.pingInterval); state.pingInterval = null; }
            if (state.connected) notifyStatus(false);
            if (!state.closed) scheduleReconnect();
        };

        ws.onerror = () => { try { ws.close(); } catch {} };
    };

    const scheduleReconnect = () => {
        if (state.closed || state.reconnectTimer) return;
        // Backoff exponencial: 3s, 6s, 12s, 24s, max 30s. Evita flood durante
        // restarts de backend (deploy) y alivia logs nginx.
        const delay = Math.min(30000, 3000 * Math.pow(2, Math.min(state.retryAttempt, 4)));
        state.reconnectTimer = setTimeout(() => {
            state.reconnectTimer = null;
            connect();
        }, delay);
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

export function subscribe(plantId, onMessage) {
    if (!plantId || typeof onMessage !== 'function') return () => { };
    let state = connections.get(plantId);
    if (!state) {
        state = openConnection(plantId);
        connections.set(plantId, state);
    }
    state.subscribers.add(onMessage);
    return () => { state.subscribers.delete(onMessage); };
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
