import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield, Zap, BarChart3, Wrench, Users, Globe, Brain, CheckCircle2,
    ArrowRight, Play, Clock, Target, Gauge, TrendingUp, Layers, Bot,
    FileText, Calendar, AlertTriangle, Smartphone, Languages,
    ScrollText, Bell, FileDown, ClipboardCheck, ExternalLink,
} from 'lucide-react';

const T = {
  en: {
    badge: 'AI-Powered Maintenance Management',
    heroTitle1: 'Transform Your',
    heroTitle2: 'Maintenance Operations',
    heroDesc: 'Enterprise-grade asset management platform with 8 AI agents, predictive analytics, email alerts, audit trail, and end-to-end maintenance workflows — from work request to closure.',
    startDemo: 'Request Demo',
    seeFeatures: 'See Features',
    apiEndpoints: 'API Endpoints', modules: 'Modules', aiAgents: 'AI Agents', userRoles: 'User Roles', languages: 'Languages', dataModels: 'Data Models',
    statusPage: 'Status',
    everythingTitle: 'Everything You Need',
    everythingDesc: 'A complete maintenance management ecosystem — from AI-powered diagnostics to SAP integration, audit compliance, and PDF reporting.',
    f1t: 'Work Management', f1d: 'Full lifecycle: Work Requests → Planning → Scheduling → Execution → Closure with SAP integration.',
    f2t: 'AI Agents (CORTEX)', f2d: '8 specialized agents: Equipment Doctor, Predictive Health, Smart Backlog, RCM Advisor, Safety Checklists, and more.',
    f3t: 'Analytics & KPIs', f3d: 'Real-time MTBF, MTTR, OEE, Availability. Executive and tactical dashboards with trend analysis and alerts.',
    f4t: 'Audit & Compliance', f4d: 'Full activity log with user tracking, date filtering, detail inspection, and CSV export. Enterprise audit trail.',
    f5t: 'Smart Scheduling', f5d: 'AI priority-based distribution. Gantt visualization, HH balance by specialty, material tracking.',
    f6t: 'Mobile PWA', f6d: 'Field technician app: create WRs, execute tasks, capture photos. Works offline with automatic sync.',
    f7t: 'Email Notifications', f7d: 'SMTP-based alerts for WR approvals, WO status changes, KPI thresholds, and critical failures.',
    f8t: 'Reports & PDF Export', f8d: 'Weekly, monthly, and operational reports. Export as XLSX, CSV, or PDF with professional formatting.',
    f9t: 'FMEA / RCM', f9d: 'Failure Mode Analysis, RCM decision logic, criticality assessment, FMECA worksheets — ISO 14224 aligned.',
    impactTitle: 'Proven Impact', impactDesc: 'Typical results from implementing AMS in industrial maintenance operations.',
    b1: 'Reduction in Unplanned Downtime', b2: 'Improvement in Schedule Adherence', b3: 'Faster Work Order Processing', b4: 'Faster Root Cause Analysis',
    platformTitle: 'Enterprise-Ready Platform', platformDesc: 'Built for scale, security, and reliability.',
    secTitle: 'Security', secItems: ['JWT + RBAC (6 roles)', 'Rate limiting & CSP', 'Full audit trail', 'SSL/HTTPS enforced'],
    mpTitle: 'Multi-Plant', mpItems: ['Unlimited plants', 'Per-plant data isolation', 'Cross-plant analytics', 'Plant-level roles'],
    perfTitle: 'Performance', perfItems: ['Gzip compression', 'Asset caching (1yr)', 'Lazy-loaded modules', 'Sub-second API'],
    scaleTitle: 'Operations', scaleItems: ['Docker Compose', 'Email notifications (SMTP)', 'Health status page', 'PDF & CSV exports'],
    ctaTitle: 'Ready to Transform Your Operations?', ctaDesc: 'Schedule a personalized demo with our team.',
    ctaBtn: 'Contact Sales',
    assessTitle: 'How mature is your maintenance?', assessDesc: 'Take our free Maintenance Maturity Scorecard - a quick assessment that benchmarks your operations against industry best practices and identifies improvement opportunities.',
    assessBtn: 'Start assessment', assessLangEs: 'Spanish', assessLangEn: 'English',
    signIn: 'Sign In', features: 'Features', benefits: 'Benefits', platform: 'Platform', docs: 'User Guide',
  },
  es: {
    badge: 'Gestion de Mantenimiento con IA',
    heroTitle1: 'Transforma tus',
    heroTitle2: 'Operaciones de Mantenimiento',
    heroDesc: 'Plataforma empresarial de gestion de activos con 8 agentes de IA, analitica predictiva, alertas por email, auditoria completa y flujos de trabajo — desde la solicitud hasta el cierre.',
    startDemo: 'Solicitar Demo',
    seeFeatures: 'Ver Funciones',
    apiEndpoints: 'Endpoints API', modules: 'Modulos', aiAgents: 'Agentes IA', userRoles: 'Roles', languages: 'Idiomas', dataModels: 'Modelos de Datos',
    statusPage: 'Estado',
    everythingTitle: 'Todo lo que Necesitas',
    everythingDesc: 'Un ecosistema completo de gestion de mantenimiento — desde diagnosticos con IA hasta integracion SAP, compliance de auditoria y reportes PDF.',
    f1t: 'Gestion de Trabajo', f1d: 'Ciclo completo: Avisos → Planificacion → Programacion → Ejecucion → Cierre con integracion SAP.',
    f2t: 'Agentes IA (CORTEX)', f2d: '8 agentes especializados: Doctor de Equipos, Salud Predictiva, Backlog Inteligente, Asesor RCM, Checklists de Seguridad.',
    f3t: 'Analitica y KPIs', f3d: 'MTBF, MTTR, OEE, Disponibilidad en tiempo real. Dashboards ejecutivos y tacticos con analisis de tendencias.',
    f4t: 'Auditoria y Compliance', f4d: 'Registro completo de actividad con seguimiento de usuarios, filtros por fecha, detalle expandible y exportacion CSV.',
    f5t: 'Programacion Inteligente', f5d: 'Distribucion por prioridad con IA. Gantt visual, balance HH por especialidad, seguimiento de materiales.',
    f6t: 'App Movil PWA', f6d: 'App para tecnicos en campo: crear avisos, ejecutar tareas, capturar fotos. Funciona offline con sincronizacion automatica.',
    f7t: 'Notificaciones Email', f7d: 'Alertas SMTP para aprobaciones de WR, cambios de estado de OT, umbrales de KPI y fallas criticas.',
    f8t: 'Reportes y PDF', f8d: 'Reportes semanales, mensuales y operacionales. Exporta como XLSX, CSV o PDF con formato profesional.',
    f9t: 'FMEA / RCM', f9d: 'Analisis de Modos de Falla, logica RCM, evaluacion de criticidad, hojas FMECA — alineado con ISO 14224.',
    impactTitle: 'Impacto Comprobado', impactDesc: 'Resultados tipicos al implementar AMS en operaciones de mantenimiento industrial.',
    b1: 'Reduccion de Paradas No Planificadas', b2: 'Mejora en Adherencia al Programa', b3: 'Procesamiento de OT mas Rapido', b4: 'Analisis de Causa Raiz mas Rapido',
    platformTitle: 'Plataforma Empresarial', platformDesc: 'Construida para escala, seguridad y confiabilidad.',
    secTitle: 'Seguridad', secItems: ['JWT + RBAC (6 roles)', 'Rate limiting y CSP', 'Auditoria completa', 'SSL/HTTPS forzado'],
    mpTitle: 'Multi-Planta', mpItems: ['Plantas ilimitadas', 'Datos aislados por planta', 'Analitica cross-planta', 'Roles por planta'],
    perfTitle: 'Rendimiento', perfItems: ['Compresion Gzip', 'Cache de assets (1 ano)', 'Modulos lazy-load', 'API sub-segundo'],
    scaleTitle: 'Operaciones', scaleItems: ['Docker Compose', 'Notificaciones email (SMTP)', 'Pagina de estado', 'Exportacion PDF y CSV'],
    ctaTitle: '¿Listo para Transformar tus Operaciones?', ctaDesc: 'Agenda una demo personalizada con nuestro equipo.',
    ctaBtn: 'Contactar Ventas',
    assessTitle: '¿Que tan maduro es tu mantenimiento?', assessDesc: 'Realiza nuestro Scorecard de Madurez de Mantenimiento gratuito - una evaluacion rapida que compara tus operaciones contra las mejores practicas de la industria e identifica oportunidades de mejora.',
    assessBtn: 'Iniciar evaluacion', assessLangEs: 'Espanol', assessLangEn: 'Ingles',
    signIn: 'Iniciar Sesion', features: 'Funciones', benefits: 'Beneficios', platform: 'Plataforma', docs: 'Manual de Usuario',
  },
};

// Not used — features are now inline with translations

// Not used — stats are inline with translations

const BENEFITS = [
    { metric: '40%', label: 'Reduction in unplanned downtime', icon: AlertTriangle },
    { metric: '25%', label: 'Improvement in schedule adherence', icon: Clock },
    { metric: '60%', label: 'Faster work order processing', icon: Zap },
    { metric: '3x', label: 'Faster root cause analysis', icon: Target },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lang, setLang] = useState('en');
    const t = T[lang];

    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/MAGEAM_LOGO.png" alt="MagEAM" className="h-24 w-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">{t.features}</a>
                        <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">{t.benefits}</a>
                        <a href="#platform" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">{t.platform}</a>
                        <a href={lang === 'es' ? '/manual-usuario.html' : '/user-guide.html'} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors hidden sm:block">{t.docs}</a>
                        <a href="/status" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">{t.statusPage}</a>
                        <a href="/security-compliance" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Security</a>
                        {/* Language toggle */}
                        <button
                            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <Languages className="w-3.5 h-3.5" />
                            {lang === 'en' ? 'ES' : 'EN'}
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        >
                            {t.startDemo}
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
                            {t.badge}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            {t.heroTitle1}
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"> {t.heroTitle2}</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t.heroDesc}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/contact')}
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center gap-2"
                            >
                                {t.startDemo} <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-base font-medium transition-all flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" /> {t.seeFeatures}
                            </button>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { value: '404', label: t.apiEndpoints, icon: Layers },
                            { value: '49+', label: t.modules, icon: Target },
                            { value: '8', label: t.aiAgents, icon: Bot },
                            { value: '6', label: t.userRoles, icon: Users },
                            { value: '2', label: t.languages, icon: Globe },
                            { value: '60+', label: t.dataModels, icon: FileText },
                        ].map(s => (
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.everythingTitle}</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.everythingDesc}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Wrench, title: t.f1t, desc: t.f1d, color: 'from-emerald-500 to-teal-500' },
                            { icon: Brain, title: t.f2t, desc: t.f2d, color: 'from-purple-500 to-indigo-500' },
                            { icon: BarChart3, title: t.f3t, desc: t.f3d, color: 'from-blue-500 to-cyan-500' },
                            { icon: ScrollText, title: t.f4t, desc: t.f4d, color: 'from-slate-500 to-zinc-500' },
                            { icon: Calendar, title: t.f5t, desc: t.f5d, color: 'from-amber-500 to-yellow-500' },
                            { icon: Smartphone, title: t.f6t, desc: t.f6d, color: 'from-pink-500 to-rose-500' },
                            { icon: Bell, title: t.f7t, desc: t.f7d, color: 'from-orange-500 to-red-500' },
                            { icon: FileDown, title: t.f8t, desc: t.f8d, color: 'from-teal-500 to-cyan-500' },
                            { icon: Shield, title: t.f9t, desc: t.f9d, color: 'from-red-500 to-orange-500' },
                        ].map(f => (
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.impactTitle}</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.impactDesc}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { metric: '40%', label: t.b1, icon: AlertTriangle },
                            { metric: '25%', label: t.b2, icon: Clock },
                            { metric: '60%', label: t.b3, icon: Zap },
                            { metric: '3x', label: t.b4, icon: Target },
                        ].map(b => (
                            <div key={b.label} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
                                <b.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                                <div className="text-4xl font-bold text-emerald-700 mb-2">{b.metric}</div>
                                <p className="text-sm text-gray-700 font-medium">{b.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assessment Scorecard CTA */}
            <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6 shadow-sm">
                        <ClipboardCheck className="w-4 h-4" /> Maintenance Maturity Scorecard
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.assessTitle}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">{t.assessDesc}</p>
                    <div className="flex items-center justify-center gap-4">
                        <a href="https://scorecard.mageam.com/ams-assessment-tool-ES.html" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
                            <ClipboardCheck className="w-5 h-5" />
                            {t.assessBtn} ({t.assessLangEs})
                            <ExternalLink className="w-4 h-4 opacity-60" />
                        </a>
                        <a href="https://scorecard.mageam.com/ams-assessment-tool-EN.html" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-indigo-700 border-2 border-indigo-200 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                            <ClipboardCheck className="w-5 h-5" />
                            {t.assessBtn} ({t.assessLangEn})
                            <ExternalLink className="w-4 h-4 opacity-60" />
                        </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Free - No account required - Takes 5 minutes</p>
                </div>
            </section>

            {/* Platform overview */}
            <section id="platform" className="py-20 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t.platformTitle}</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t.platformDesc}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, title: t.secTitle, items: t.secItems },
                            { icon: Globe, title: t.mpTitle, items: t.mpItems },
                            { icon: Gauge, title: t.perfTitle, items: t.perfItems },
                            { icon: TrendingUp, title: t.scaleTitle, items: t.scaleItems },
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.ctaTitle}</h2>
                    <p className="text-lg text-gray-600 mb-8">{t.ctaDesc}</p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl flex items-center gap-3 mx-auto"
                    >
                        {t.ctaBtn} <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <a href="https://valuestrategyconsulting.com/" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-lg px-4 py-2 transition-colors">
                            <Globe className="w-4 h-4" /> Value Strategy Consulting
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        MagEAM v2.0 — Value Strategy Consulting
                    </p>
                </div>
            </section>
        </div>
    );
}
