import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Wrench, FileText, Calendar, CheckCircle, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    title: 'Registra un aviso',
    body: 'El mantenedor reporta la falla desde Failures & Events. Subís fotos, audio y la IA sugiere causa probable y acciones.',
    cta: 'Ir a Failures',
    route: '/failures',
  },
  {
    icon: Wrench,
    title: 'Planifica la OT',
    body: 'Work Management → Planning. La OT nace con operaciones, materiales y costos sugeridos. Reserva repuestos y asigna puesto de trabajo.',
    cta: 'Ir a Planning',
    route: '/work-management?tab=planning',
  },
  {
    icon: Calendar,
    title: 'Programa la semana',
    body: 'Scheduling — arrastra las OTs al calendario por técnico. Auto-Level IA distribuye respetando capacidad. Reservá la semana cuando quede.',
    cta: 'Ir a Scheduling',
    route: '/work-management?tab=scheduling',
  },
  {
    icon: CheckCircle,
    title: 'Ejecuta y cierra',
    body: 'Supervisor ve las OTs en Execution. Iniciar, progresar, cerrar con firma. Cierre pide HH reales por operación y graba observaciones por voz.',
    cta: 'Ir a Execution',
    route: '/work-management?tab=execution',
  },
];

export default function WelcomeCard() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('mageam_welcomed') === '1'; } catch { return false; }
  });
  const [step, setStep] = useState(0);

  if (dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem('mageam_welcomed', '1'); } catch {}
    setDismissed(true);
  };

  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-white to-indigo-50 dark:from-emerald-900/20 dark:via-card dark:to-indigo-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm">
      <button onClick={dismiss} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
        title="No mostrar de nuevo">
        <X size={16} />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-emerald-600" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Bienvenido a MAGEAM
        </span>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
          <Icon size={22} className="text-emerald-700 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-muted-foreground">Paso {step + 1}/{STEPS.length}</span>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground leading-tight mb-1">{s.title}</h3>
          <p className="text-sm text-muted-foreground leading-snug">{s.body}</p>
          <div className="flex items-center gap-2 mt-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted">
                Atrás
              </button>
            )}
            <button onClick={() => navigate(s.route)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              {s.cta}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted ml-auto">
                Siguiente →
              </button>
            ) : (
              <button onClick={dismiss}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 ml-auto">
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
