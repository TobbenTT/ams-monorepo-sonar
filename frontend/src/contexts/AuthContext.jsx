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

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchMe(token)
                .then(u => setUser(u))
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

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
        setToken(data.access_token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
        if (data.user) setUser(data.user);
        return data.access_token;
    }, [logout]);

    const setUserData = useCallback((data) => {
        setUser(data);
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
