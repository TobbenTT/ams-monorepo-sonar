import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

async function fetchMe(token) {
    const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
}

// David 2026-04-28: persistir el user en localStorage para que wsSingleton.js
// lo lea y mande user_id al server. Antes el WS conectaba como user=None y
// la detección de sesión compartida + audit trail no atribuían eventos.
const USER_KEY = 'user';
function persistUser(u) {
    try {
        if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
        else localStorage.removeItem(USER_KEY);
    } catch { /* ignore quota */ }
}
function readPersistedUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => readPersistedUser());
    const [token, setToken] = useState(() => localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        if (token) {
            fetchMe(token)
                .then(u => {
                    if (cancelled) return;
                    setUser(u);
                    persistUser(u);
                })
                .catch(() => {
                    if (cancelled) return;
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    persistUser(null);
                    setToken(null);
                    setUser(null);
                })
                .finally(() => { if (!cancelled) setLoading(false); });
        } else {
            setLoading(false);
        }
        return () => { cancelled = true; };
    }, [token]);

    const login = useCallback(async (username, password) => {
        const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Login fallido');
        }
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        persistUser(data.user);
        setToken(data.access_token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        persistUser(null);
        setToken(null);
        setUser(null);
    }, []);

    const refreshAccessToken = useCallback(async () => {
        const rt = localStorage.getItem('refresh_token');
        if (!rt) { logout(); return null; }
        const res = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: rt }),
        });
        if (!res.ok) { logout(); return null; }
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setToken(data.access_token);
        if (data.user) {
            setUser(data.user);
            persistUser(data.user);
        }
        return data.access_token;
    }, [logout]);

    const setUserData = useCallback((data) => {
        setUser(data);
        persistUser(data);
    }, []);

    const hasRole = useCallback((...roles) => {
        return user && roles.includes(user.role);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshAccessToken, hasRole, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
}
