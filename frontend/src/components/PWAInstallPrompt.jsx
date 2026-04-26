import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * Banner "Instalar como app" — Tanda mejoras 2026-04-25 (E1).
 * - Captura beforeinstallprompt y lo dispara al click del usuario.
 * - Solo aparece en móviles (viewport < 768px) y si NO está ya instalada.
 * - Persiste dismiss en localStorage para no molestar.
 */
const DISMISS_KEY = 'pwa_install_dismissed_at';
const DISMISS_DAYS = 14;

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (isStandalone) return;

    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissed && Date.now() - dismissed < DISMISS_DAYS * 24 * 3600 * 1000) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferred) return null;

  const onInstall = async () => {
    try {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === 'dismissed') {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
      }
    } catch {}
    setVisible(false);
    setDeferred(null);
  };

  const onDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:hidden">
      <div className="bg-emerald-600 text-white rounded-xl shadow-2xl p-3 flex items-center gap-3">
        <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Instalar AMS</p>
          <p className="text-[11px] text-emerald-50/90 leading-tight mt-0.5">
            Acceso rápido desde tu pantalla de inicio.
          </p>
        </div>
        <button
          onClick={onInstall}
          className="bg-white text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-emerald-50 transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={onDismiss}
          className="text-white/80 hover:text-white p-1 flex-shrink-0"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
