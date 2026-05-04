// SF-572 — Modal de notificación parcial multi-turno.
// Reemplaza los 3 window.prompt del flujo CE1 con un formulario decente:
// dropdown de técnico (filtrado por op.specialty), dropdown de turno e input HH.
import { useState, useEffect, useMemo } from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';
import { listTechnicians, notifyManagedWOPartial } from '../api';
import { useToast } from './Toast';

export default function PartialNotifyModal({
  open,
  onClose,
  wo,
  op,             // operation object
  opIndex,        // op index in wo.operations (fallback for op_seq)
  plantId,
  onSuccess,
}) {
  const toast = useToast();
  const [techs, setTechs] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [techId, setTechId] = useState('');
  const [shift, setShift] = useState('day');
  // Jorge 2026-05-04 (#18): HH no se digita. Es duración × cantidad personas.
  const [duration, setDuration] = useState('1');   // horas
  const [people, setPeople] = useState('1');       // cantidad personas
  // Jorge 2026-05-04 (#19): captura fecha + hora reales de ejecución.
  const [execDate, setExecDate] = useState(''); // YYYY-MM-DD
  const [execTime, setExecTime] = useState(''); // HH:MM
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // HH calculadas auto = duración × personas (readonly visible)
  const hh = useMemo(() => {
    const d = parseFloat(duration) || 0;
    const p = parseInt(people, 10) || 0;
    return Math.round(d * p * 100) / 100;
  }, [duration, people]);

  useEffect(() => {
    if (!open) return;
    setLoadingTechs(true);
    listTechnicians({ plant_id: plantId })
      .then(r => {
        const list = Array.isArray(r) ? r : (r?.technicians || []);
        setTechs(list);
      })
      .catch(() => setTechs([]))
      .finally(() => setLoadingTechs(false));
    setDuration(String(op?.planned_duration || op?.hours || 1));
    setPeople(String(op?.quantity || op?.workers_count || 1));
    setTechId('');
    setShift(wo?.shift || 'day');
    // Default date/time = ahora (formato local sin zona)
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    setExecDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setExecTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    setNote('');
  }, [open, plantId, op, wo]);

  // Filtrar técnicos por op.specialty (substring match tolerante, igual que backend)
  const opSpec = (op?.specialty || op?.work_center || wo?.work_center || '').toUpperCase();
  const filteredTechs = useMemo(() => {
    if (!opSpec) return techs;
    const norm = opSpec.toLowerCase();
    const match = techs.filter(t => {
      const ts = (t.specialty || '').toLowerCase();
      const tk = (t.skills || []).map(s => String(s).toLowerCase());
      return ts.includes(norm.slice(0, 3)) || norm.includes(ts.slice(0, 3))
        || tk.some(s => s.includes(norm.slice(0, 3)) || norm.includes(s.slice(0, 3)));
    });
    return match.length > 0 ? match : techs;
  }, [techs, opSpec]);

  if (!open) return null;
  const submit = async () => {
    if (!hh || hh <= 0) { toast.error('Duración × personas debe ser > 0'); return; }
    if (!techId) { toast.error('Seleccione técnico'); return; }
    if (!execDate || !execTime) { toast.error('Fecha y hora de ejecución obligatorias'); return; }
    setSubmitting(true);
    try {
      const noteParts = [];
      if (note.trim()) noteParts.push(note.trim());
      noteParts.push(`exec_at=${execDate}T${execTime}`);
      noteParts.push(`duration=${duration}h × ${people}p`);
      const res = await notifyManagedWOPartial(wo.wo_id, {
        op_seq: op?.op_number || op?.seq || (opIndex + 1),
        hours: hh,
        technician_id: techId,
        shift,
        note: noteParts.join(' · '),
      });
      if (res.final_auto_triggered) {
        toast.success('✓ Todas las ops al 100% — Notificación FINAL gatillada automáticamente');
      } else {
        toast.success('Notificación parcial registrada');
      }
      onSuccess && onSuccess(res);
      onClose();
    } catch (e) {
      toast.error('Error: ' + (e.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-gradient-to-r from-purple-50 to-purple-100">
          <Clock className="w-5 h-5 text-purple-700" />
          <div className="flex-1">
            {/* Jorge 2026-05-04: rebranding — el concepto "parcial" confunde
                al usuario. La notificación es por operación; si quedan ops
                pendientes el sistema infiere que es parcial automáticamente. */}
            <h3 className="text-base font-bold text-gray-900">Notificación de operación</h3>
            <p className="text-xs text-gray-600 truncate">
              Op #{op?.op_number || (opIndex + 1)} · {(op?.description || '').slice(0, 50) || '—'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/60"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3">
          {/* Técnico */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Técnico
              {opSpec && <span className="text-[10px] text-purple-700">· filtro: {opSpec}</span>}
            </label>
            <select value={techId} onChange={e => setTechId(e.target.value)}
              disabled={loadingTechs}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30">
              <option value="">{loadingTechs ? 'Cargando...' : '— seleccionar —'}</option>
              {filteredTechs.map(t => (
                <option key={t.id || t.worker_id} value={t.id || t.worker_id}>
                  {t.name} {t.specialty ? `· ${t.specialty}` : ''} {t.shift ? `· ${t.shift}` : ''}
                </option>
              ))}
            </select>
            {filteredTechs.length === 0 && !loadingTechs && (
              <p className="text-[11px] text-amber-600 mt-1">Sin técnicos disponibles para esta especialidad.</p>
            )}
          </div>

          {/* Jorge 2026-05-04 — Turno + Fecha/Hora ejecución (#19) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Turno</label>
              <select value={shift} onChange={e => setShift(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30">
                <option value="day">Día (07:00-19:00)</option>
                <option value="night">Noche (19:00-07:00)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha
              </label>
              <input type="date" value={execDate} onChange={e => setExecDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Hora
              </label>
              <input type="time" value={execTime} onChange={e => setExecTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
          </div>

          {/* Jorge 2026-05-04 (#18) — HH NUNCA se digita: duración × personas → HH auto */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Duración (h)</label>
              <input type="number" min="0.25" step="0.25" value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Personas</label>
              <input type="number" min="1" step="1" value={people}
                onChange={e => setPeople(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">HH (auto)</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm font-mono text-gray-800">
                {hh.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Nota opcional — Jorge 2026-05-04: textarea multilinea (antes era
              input). Acá los técnicos dejan harto comentario, una sola línea
              cortaba la información. */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Nota (opcional)</label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)} rows={4}
              placeholder="Ej: avance al 60%, falta sello del lado derecho. Se detecta vibración levemente sobre el tope.\nObservaciones para el siguiente turno..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-y" />
          </div>

          {/* Resumen plan vs */}
          <div className="bg-purple-50 rounded-lg p-2 text-[11px] text-purple-800">
            <div className="flex justify-between">
              <span>HH planificadas op:</span>
              <strong>{(op?.planned_hours || op?.hours || 0).toFixed(1)}h</strong>
            </div>
            <div className="flex justify-between">
              <span>HH acumuladas previas:</span>
              <strong>{((op?.notifications || []).reduce((s, n) => s + (n.hours || 0), 0)).toFixed(1)}h</strong>
            </div>
            <div className="flex justify-between border-t border-purple-200 pt-1 mt-1">
              <span>Después de esta notif:</span>
              <strong>{(((op?.notifications || []).reduce((s, n) => s + (n.hours || 0), 0)) + (parseFloat(hours) || 0)).toFixed(1)}h</strong>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-3 border-t border-border bg-muted/30">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={submit}
            disabled={submitting || !techId || !hours}
            className="flex-1 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? 'Registrando...' : 'Registrar parcial'}
          </button>
        </div>
      </div>
    </div>
  );
}
