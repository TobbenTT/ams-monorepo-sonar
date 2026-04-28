// SF-579 — Modal de cancelación de OT con tipología (ABSORBED / NOT_NEEDED / OTHER).
// Reusable desde Planning, Scheduling, SupervisorBoard. Si type=ABSORBED valida
// que la OT absorbente exista y sea PM03 antes de enviar al backend.
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import * as api from '../api';
import { useToast } from './Toast';

export default function CancelWOModal({
  open,
  onClose,
  wo,            // { wo_id, wo_number, plant_id }
  candidatePM03s, // optional pre-fetched list of PM03 WOs in plant for validation
  onSuccess,
}) {
  const toast = useToast();
  const [cancelType, setCancelType] = useState('NOT_NEEDED');
  const [reason, setReason] = useState('');
  const [absorbedByNum, setAbsorbedByNum] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pm03List, setPm03List] = useState([]);

  useEffect(() => {
    if (!open) return;
    setCancelType('NOT_NEEDED');
    setReason('');
    setAbsorbedByNum('');
    if (Array.isArray(candidatePM03s)) {
      setPm03List(candidatePM03s);
    } else if (wo?.plant_id) {
      api.listManagedWOs({ plant_id: wo.plant_id, wo_type: 'PM03', limit: 200 })
        .then(r => {
          const list = Array.isArray(r) ? r : (r?.items || []);
          setPm03List(list.filter(w => w.wo_type === 'PM03' && !['CERRADO', 'CANCELADO'].includes(w.status)));
        })
        .catch(() => setPm03List([]));
    }
  }, [open, wo?.plant_id]);

  if (!open || !wo) return null;
  const blocked =
    (cancelType === 'ABSORBED' && !absorbedByNum.trim()) ||
    (cancelType === 'OTHER' && !reason.trim());

  const submit = async () => {
    setSubmitting(true);
    try {
      let absorbedId = null;
      if (cancelType === 'ABSORBED') {
        const num = absorbedByNum.trim();
        const match = pm03List.find(w => w.wo_number === num);
        if (!match) { toast.error('OT PM03 absorbente no encontrada en planta'); setSubmitting(false); return; }
        absorbedId = match.wo_id;
      }
      await api.cancelManagedWO(wo.wo_id, {
        reason: reason.trim() || null,
        cancellation_type: cancelType,
        absorbed_by_wo_id: absorbedId,
      });
      toast.success(cancelType === 'ABSORBED'
        ? `OT cancelada por absorción → ${absorbedByNum}`
        : `OT cancelada: ${wo.wo_number}`);
      onSuccess && onSuccess();
      onClose();
    } catch (e) {
      toast.error('Error: ' + (e.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Cancelar OT</h3>
              <p className="text-xs text-gray-500">{wo.wo_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Tipo de cancelación *</label>
          <select value={cancelType} onChange={e => setCancelType(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30">
            <option value="ABSORBED">Absorbida por OT de falla (PM03)</option>
            <option value="NOT_NEEDED">Ya no es necesaria</option>
            <option value="OTHER">Otros</option>
          </select>
        </div>

        {cancelType === 'ABSORBED' && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">N° OT PM03 absorbente *</label>
            <input list="pm03-options" value={absorbedByNum} onChange={e => setAbsorbedByNum(e.target.value)}
              placeholder="OT-2026-XXXXX"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            <datalist id="pm03-options">
              {pm03List.map(w => <option key={w.wo_id} value={w.wo_number}>{w.equipment_tag} · {w.description?.slice(0, 40)}</option>)}
            </datalist>
            <p className="text-[11px] text-gray-500 mt-1">
              {pm03List.length} OT PM03 activas en planta. Quedará linkeada en histórico.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">
            Comentario {cancelType === 'OTHER' ? '*' : ''}
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Detalle adicional..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 min-h-[70px]" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
            Volver
          </button>
          <button disabled={blocked || submitting} onClick={submit}
            className="flex-1 py-2.5 px-4 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? 'Cancelando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
