import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield, Zap, BarChart3, Wrench, Users, Globe, Brain, CheckCircle2,
    ArrowRight, Play, Clock, Target, Gauge, TrendingUp, Layers, Bot,
    FileText, Calendar, AlertTriangle, Smartphone
} from 'lucide-react';

const FEATURES = [
    { icon: Wrench, title: 'Work Management', desc: 'Full lifecycle: Work Requests → Planning → Scheduling → Execution → Closure. SAP-integrated workflows.', color: 'from-emerald-500 to-teal-500' },
    { icon: Brain, title: 'AI Agents (CORTEX)', desc: '33 specialized agents for predictive maintenance, RCA, equipment diagnostics, and autonomous scheduling.', color: 'from-purple-500 to-indigo-500' },
    { icon: BarChart3, title: 'Analytics & KPIs', desc: 'Real-time MTBF, MTTR, OEE, availability tracking. Executive and tactical views with trend analysis.', color: 'from-blue-500 to-cyan-500' },
    { icon: Shield, title: 'FMEA / RCM', desc: 'Failure Mode Analysis, RCM decision logic, criticality assessment, and FMECA worksheets.', color: 'from-red-500 to-orange-500' },
    { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered priority-based distribution. Gantt visualization, HH balance, material tracking.', color: 'from-amber-500 to-yellow-500' },
    { icon: Smartphone, title: 'Mobile Field App', desc: 'PWA for technicians: create WRs, execute tasks, capture photos — works offline.', color: 'from-pink-500 to-rose-500' },
];

const STATS = [
    { value: '404', label: 'API Endpoints', icon: Layers },
    { value: '49+', label: 'Modules', icon: Target },
    { value: '33', label: 'AI Agents', icon: Bot },
    { value: '6', label: 'User Roles', icon: Users },
    { value: '3', label: 'Languages', icon: Globe },
    { value: '60+', label: 'Data Models', icon: FileText },
];

const BENEFITS = [
    { metric: '40%', label: 'Reduction in unplanned downtime', icon: AlertTriangle },
    { metric: '25%', label: 'Improvement in schedule adherence', icon: Clock },
    { metric: '60%', label: 'Faster work order processing', icon: Zap },
    { metric: '3x', label: 'Faster root cause analysis', icon: Target },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // If already logged in, go to dashboard
    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/AMS_LOGO.png" alt="AMS" className="w-8 h-8 rounded-lg" />
                        <span className="text-xl font-bold text-gray-900">AMS Platform</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Enterprise</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Features</a>
                        <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Benefits</a>
                        <a href="#platform" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Platform</a>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-sm text-emerald-700 font-medium mb-8">
                            <Zap className="w-4 h-4" />
                            AI-Powered Maintenance Management
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Transform Your
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"> Maintenance Operations</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Enterprise-grade asset management platform with 33 AI agents, predictive analytics,
                            and end-to-end maintenance workflows — from work request to closure.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center gap-2"
                            >
                                Start Demo <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-base font-medium transition-all flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" /> See Features
                            </button>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {STATS.map(s => (
                            <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                <s.icon className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">A complete maintenance management ecosystem — from AI-powered diagnostics to SAP integration.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all group">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits / ROI */}
            <section id="benefits" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Proven Impact</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Typical results from implementing AMS in industrial maintenance operations.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {BENEFITS.map(b => (
                            <div key={b.label} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
                                <b.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                                <div className="text-4xl font-bold text-emerald-700 mb-2">{b.metric}</div>
                                <p className="text-sm text-gray-700 font-medium">{b.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform overview */}
            <section id="platform" className="py-20 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Platform</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">Built for scale, security, and reliability.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, title: 'Security', items: ['JWT + RBAC auth', 'Rate limiting', 'CSP + HSTS headers', 'Encrypted passwords'] },
                            { icon: Globe, title: 'Multi-Plant', items: ['Unlimited plants', 'Per-plant data isolation', 'Cross-plant analytics', 'Plant-level roles'] },
                            { icon: Gauge, title: 'Performance', items: ['Gzip compression', 'Asset caching (1yr)', 'Lazy-loaded modules', 'Sub-second API'] },
                            { icon: TrendingUp, title: 'Scalable', items: ['Docker Compose', 'PostgreSQL ready', 'Redis-compatible', 'Horizontal scaling'] },
                        ].map(p => (
                            <div key={p.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <p.icon className="w-8 h-8 text-emerald-400 mb-4" />
                                <h3 className="text-lg font-semibold mb-3">{p.title}</h3>
                                <ul className="space-y-2">
                                    {p.items.map(item => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Operations?</h2>
                    <p className="text-lg text-gray-600 mb-8">Start with a free demo. No credit card required.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl flex items-center gap-3 mx-auto"
                    >
                        Access Platform <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-gray-400 mt-6">
                        AMS Platform v2.0 — Value Strategy Consulting
                    </p>
                </div>
            </section>
        </div>
    );
}
