import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff, AlertCircle, Shield, Wrench, BarChart3, Globe } from 'lucide-react';

const LANG_OPTIONS = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇲🇦' },
];

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t, lang, setLang } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || t('auth.authError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669]">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 border border-white/30 rounded-full" />
                    <div className="absolute bottom-32 right-20 w-96 h-96 border border-white/20 rounded-full" />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/20 rounded-full" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden">
                            <img src="/AMS_LOGO.png" alt="AMS" className="w-18 h-18 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{t('login.title')}</h1>
                            <p className="text-green-200 text-sm font-medium">{t('login.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold leading-tight mb-4 whitespace-pre-line">
                            {t('login.headline')}
                        </h2>
                        <p className="text-green-100 text-lg max-w-lg leading-relaxed">
                            {t('login.description')}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 max-w-lg">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <Shield className="w-6 h-6 text-green-200 mb-2" />
                            <div className="text-sm font-semibold">{t('login.reliabilityCard')}</div>
                            <div className="text-xs text-green-200 mt-0.5">FMEA, RCM, RCA</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <Wrench className="w-6 h-6 text-green-200 mb-2" />
                            <div className="text-sm font-semibold">{t('login.planningCard')}</div>
                            <div className="text-xs text-green-200 mt-0.5">Backlog, Scheduling</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <BarChart3 className="w-6 h-6 text-green-200 mb-2" />
                            <div className="text-sm font-semibold">{t('login.analyticsCard')}</div>
                            <div className="text-xs text-green-200 mt-0.5">KPIs, Reports</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-green-200 text-sm">
                    {t('login.copyright', { year: new Date().getFullYear() })}
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-background lg:rounded-l-[2rem]">
                <div className="w-full max-w-md">
                    {/* Language Selector */}
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                            {LANG_OPTIONS.map(opt => (
                                <button
                                    key={opt.code}
                                    onClick={() => setLang(opt.code)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                        lang === opt.code
                                            ? 'bg-[#047857] text-white shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background'
                                    }`}
                                >
                                    <span>{opt.flag}</span>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-[#047857] rounded-xl flex items-center justify-center overflow-hidden">
                            <img src="/AMS_LOGO.png" alt="AMS" className="w-14 h-14 object-contain" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-foreground">AMS Platform</div>
                            <div className="text-xs text-muted-foreground">Industrial Platform</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-foreground">{t('auth.welcome')}</h2>
                        <p className="text-muted-foreground mt-1">{t('auth.enterCredentials')}</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800 mb-5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
                                {t('auth.username')}
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                                autoFocus
                                autoComplete="username"
                                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857] transition-colors placeholder:text-muted-foreground"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857] transition-colors placeholder:text-muted-foreground pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[#047857] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-[#047857]/25 disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? t('auth.signingIn') : t('auth.signIn')}
                        </button>
                    </form>

                    {/* Quick login buttons */}
                    <div className="mt-6">
                        <div className="text-xs text-muted-foreground text-center mb-3">{t('auth.quickAccess') || 'Acceso rápido'}</div>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { user: 'admin', role: 'Administrator', color: '#047857', pass: 'password123' },
                                { user: 'planner1', role: 'Planner', color: '#2563eb', pass: 'Planner123' },
                                { user: 'tecnico1', role: 'T\u00e9cnico', color: '#d97706', pass: 'Technician123' },
                                { user: 'supervisor1', role: 'Supervisor', color: '#7c3aed', pass: 'Supervisor123' },
                                { user: 'manager1', role: 'Manager', color: '#dc2626', pass: 'Manager123' },
                            ].map(({ user, role, color, pass }) => (
                                <button
                                    key={user}
                                    type="button"
                                    onClick={() => { setUsername(user); setPassword(pass); }}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                                        {user[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-foreground truncate">{user}</div>
                                        <div className="text-[10px] text-muted-foreground">{role}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
