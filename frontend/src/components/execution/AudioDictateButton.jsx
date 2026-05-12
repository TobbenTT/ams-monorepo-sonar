import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '../Toast';

/**
 * Fase 7 Jorge 2026-04-21 — grabar nota de voz en el cierre + transcribir.
 * Usa MediaRecorder + endpoint /media/transcribe (whisper) ya existente.
 *
 * Extraído de Execution.jsx en refactor 2026-05-12.
 */
export default function AudioDictateButton({ onText }) {
  const toast = useToast();
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useState({ current: null })[0];

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setBusy(true);
        try {
          const res = await import('../../api').then(m => m.transcribeAudio(blob, 'es'));
          const txt = res?.text || res?.transcript || '';
          if (txt) onText(txt.trim());
        } catch (e) {
          toast.error('Error al transcribir: ' + (e.message || ''));
        } finally {
          setBusy(false);
        }
      };
      recRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      toast.error('No se pudo activar el micrófono: ' + (e.message || ''));
    }
  };

  const stop = () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    setRecording(false);
  };

  if (busy) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Loader2 size={11} className="animate-spin" /> Transcribiendo…
      </span>
    );
  }
  return (
    <button type="button" onClick={recording ? stop : start}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded ${recording ? 'bg-rose-600 text-white animate-pulse' : 'bg-muted text-foreground hover:bg-muted/70'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${recording ? 'bg-white' : 'bg-rose-500'}`} />
      {recording ? 'Detener' : 'Grabar nota'}
    </button>
  );
}
