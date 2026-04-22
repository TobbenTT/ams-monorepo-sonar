import { useState, useRef } from 'react';
import { Mic, MicOff, Camera, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import * as api from '../api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * SF-343 VoiceCapture Pro — "Sin tocar formularios".
 * Tech speaks + takes photo → backend agent transcribes, classifies, creates WR
 * with SLA and notifies supervisor. Shows a confirmation with the classification
 * result so the tech can verify before leaving the screen.
 */
export default function SmartCaptureModal({ plantId, technicianId, equipmentTagHint, onClose, onCreated }) {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [photo, setPhoto] = useState(null); // data URL
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // confirmation payload
    const [error, setError] = useState(null);
    const cameraRef = useRef(null);
    const recognitionRef = useRef(null);
    const baseTextRef = useRef('');

    const handleMic = () => {
        if (!SpeechRecognition) {
            setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome.');
            return;
        }
        if (isRecording) { recognitionRef.current?.stop(); return; }

        const rec = new SpeechRecognition();
        rec.lang = 'es-ES';
        rec.continuous = true;
        rec.interimResults = true;
        recognitionRef.current = rec;
        baseTextRef.current = text;
        let finalTranscript = '';

        rec.onstart = () => setIsRecording(true);
        rec.onresult = (ev) => {
            let interim = '';
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                const tr = ev.results[i][0].transcript;
                if (ev.results[i].isFinal) finalTranscript += tr + ' ';
                else interim += tr;
            }
            const base = baseTextRef.current;
            const sep = base ? ' ' : '';
            setText((base + sep + finalTranscript + interim).trimEnd());
        };
        rec.onerror = () => setIsRecording(false);
        rec.onend = () => {
            setIsRecording(false);
            if (finalTranscript.trim()) {
                const base = baseTextRef.current;
                const sep = base ? ' ' : '';
                setText((base + sep + finalTranscript).trimEnd());
            }
        };
        rec.start();
    };

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError(`Archivo "${file.name}" pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: 10 MB.`);
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setPhoto(ev.target.result);
        reader.readAsDataURL(file);
    };

    const submit = async () => {
        if (!text.trim()) {
            setError('Describe la falla (puedes dictarla o escribirla)');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const res = await api.voiceCapture({
                text_input: text.trim(),
                image_base64: photo,
                equipment_tag_hint: equipmentTagHint || undefined,
                plant_id: plantId,
                technician_id: technicianId,
                language: 'es',
            });
            const payload = res?.result || res;
            setResult(payload);
            onCreated?.(payload);
        } catch (e) {
            setError(e?.message || 'No se pudo crear el aviso');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Confirmation view ───────────────────────────────────────────────
    if (result) {
        const c = result.classification || {};
        return (
            <div className="fixed inset-0 z-[200] flex items-end justify-center">
                <div className="absolute inset-0 bg-black/50" onClick={onClose} />
                <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <div className="text-lg font-bold text-slate-900">Aviso creado</div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <Row label="ID" value={result.work_request_id} />
                        <Row label="Equipo" value={result.equipment_tag} />
                        <Row label="Prioridad" value={result.priority_code} />
                        <Row label="Categoría" value={c.failure_category} />
                        <Row label="Parte" value={c.failure_object_part} />
                        <Row label="Síntoma" value={c.failure_symptom} />
                        <Row label="Causa" value={c.failure_cause} />
                        <Row label="Acción sugerida" value={c.suggested_action} />
                        <Row label="SLA" value={result.sla_deadline ? new Date(result.sla_deadline).toLocaleString('es') : '—'} />
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-5 w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                    >
                        Listo
                    </button>
                </div>
            </div>
        );
    }

    // ── Capture view ────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={submitting ? undefined : onClose} />
            <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-slate-900">Captura Inteligente</div>
                        <div className="text-xs text-slate-500">Dictá la falla y sacá una foto — el asistente crea el aviso</div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" disabled={submitting}>
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Voice + text area */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-slate-500 tracking-wide">DESCRIPCIÓN DE LA FALLA</label>
                            <button
                                onClick={handleMic}
                                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg ${isRecording ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}
                                disabled={submitting}
                            >
                                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                {isRecording ? 'Parar' : 'Dictar'}
                            </button>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ej: la bomba 120-PU-001 vibra y hace ruido anormal"
                            className="w-full h-28 p-3 rounded-xl border text-sm resize-none outline-none border-slate-200 bg-slate-50"
                            disabled={submitting}
                        />
                    </div>

                    {/* Photo */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 tracking-wide block mb-2">FOTO (OPCIONAL · MÁX 10 MB)</label>
                        <input
                            ref={cameraRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhoto}
                            className="hidden"
                        />
                        {photo ? (
                            <div className="relative">
                                <img src={photo} alt="captura" className="w-full h-48 object-cover rounded-xl border" />
                                <button
                                    onClick={() => setPhoto(null)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                                    disabled={submitting}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => cameraRef.current?.click()}
                                className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-500 text-sm"
                                disabled={submitting}
                            >
                                <Camera className="w-5 h-5" />
                                Tomar foto
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={submit}
                        disabled={submitting || !text.trim()}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>) : 'Crear Aviso'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-xs text-slate-500 w-28 flex-shrink-0">{label}</div>
            <div className="text-sm text-slate-900 flex-1 break-words">{value || '—'}</div>
        </div>
    );
}
