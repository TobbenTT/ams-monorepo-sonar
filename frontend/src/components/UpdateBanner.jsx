import { useState, useEffect, useRef } from 'react';

/**
 * Polls /health every 30s. When the build hash changes (server redeployed),
 * shows a full-screen popup prompting the user to reload.
 */
export default function UpdateBanner() {
  const [show, setShow] = useState(false);
  const knownBuild = useRef(null);

  useEffect(() => {
    let timer;

    async function check() {
      try {
        const res = await fetch('/health', { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.build) return;

        if (knownBuild.current === null) {
          knownBuild.current = data.build;
          return;
        }

        if (data.build !== knownBuild.current) {
          setShow(true);
        }
      } catch {
        /* offline or timeout */
      }
    }

    check();
    timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'upFadeIn .3s ease-out',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 16, padding: '32px 36px',
          maxWidth: 420, width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'upScaleIn .3s ease-out',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚀</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#f1f5f9' }}>
          Nueva version disponible
        </h3>
        <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Se ha actualizado la plataforma con mejoras y correcciones. Recarga para obtener la ultima version.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => location.reload()}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff', border: 'none',
              padding: '10px 28px', borderRadius: 10,
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Recargar ahora
          </button>
          <button
            onClick={() => {
              setShow(false);
              setTimeout(() => setShow(true), 5 * 60 * 1000);
            }}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#94a3b8',
              border: '1px solid #334155',
              padding: '10px 20px', borderRadius: 10,
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Mas tarde
          </button>
        </div>
      </div>

      <style>{`
        @keyframes upFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes upScaleIn { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}
