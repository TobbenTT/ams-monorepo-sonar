import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus, X, Star, Camera, Trash2, Bug, Lightbulb, HelpCircle, Wrench, Send, Paperclip, Monitor, Video, StopCircle, ChevronDown, ChevronUp, Mail, Users, Repeat, TrendingUp, Info } from 'lucide-react';
import * as api from '../api';
import { useToast } from '../components/Toast';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug / Error', icon: Bug, color: '#EF4444', bg: '#FEE2E2' },
  { value: 'suggestion', label: 'Sugerencia', icon: Lightbulb, color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'improvement', label: 'Mejora', icon: Wrench, color: '#3B82F6', bg: '#DBEAFE' },
  { value: 'question', label: 'Pregunta', icon: HelpCircle, color: '#8B5CF6', bg: '#EDE9FE' },
];

const PRIORITIES = [
  { value: 'low', label: 'Baja', color: '#10B981' },
  { value: 'medium', label: 'Media', color: '#F59E0B' },
  { value: 'high', label: 'Alta', color: '#F97316' },
  { value: 'critical', label: 'Critica', color: '#EF4444' },
];

const APP_SECTIONS = [
  'Dashboard',
  'Work Orders',
  'Fallas y Eventos',
  'Acciones de Mejora',
  'Analitica',
  'Reportes',
  'Equipo',
  'Settings',
  'Sidebar / Menu',
  'Header / Barra superior',
  'Login',
  'Vista Mobile',
  'General / Otro',
];

const FREQUENCIES = [
  { value: 'always', label: 'Siempre' },
  { value: 'sometimes', label: 'A veces' },
  { value: 'rarely', label: 'Rara vez' },
  { value: 'first_time', label: 'Primera vez' },
];

const IMPACT_LEVELS = [
  { value: 'only_me', label: 'Solo yo', icon: '👤' },
  { value: 'my_team', label: 'Mi equipo', icon: '👥' },
  { value: 'everyone', label: 'Todos los usuarios', icon: '🌐' },
  { value: 'unknown', label: 'No estoy seguro', icon: '❓' },
];

const INITIAL_FORM = {
  feedback_type: 'suggestion',
  priority: 'medium',
  title: '',
  description: '',
  rating: 3,
  section: '',
  steps_to_reproduce: '',
  expected_behavior: '',
  actual_behavior: '',
  frequency: '',
  impact: '',
  contact_email: '',
  desired_behavior: '',
  expected_benefit: '',
};

export default function FeedbackWidget() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: type, 2: details+attachments, 3: confirm
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [screenshots, setScreenshots] = useState([]); // [{data_url, caption, preview}]
  const [files, setFiles] = useState([]); // File objects for post-submit upload
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [showEnvInfo, setShowEnvInfo] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const location = useLocation();

  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Auto-detect page info
  const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.replace(/^\//, '').replace(/-/g, ' ');

  const envInfo = {
    url: typeof window !== 'undefined' ? window.location.href : '',
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    device: typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop') : '',
    os: typeof navigator !== 'undefined' ? navigator.platform || '' : '',
    language: typeof navigator !== 'undefined' ? navigator.language : '',
  };

  // Screenshot from clipboard paste
  const handlePaste = useCallback((e) => {
    if (!open) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          setScreenshots(prev => [...prev, { data_url: ev.target.result, caption: '', preview: ev.target.result }]);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  }, [open]);

  // Add screenshot from file picker
  const handleScreenshotSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshots(prev => [...prev, { data_url: ev.target.result, caption: '', preview: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Add file attachments
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = '';
  };

  const removeScreenshot = (idx) => setScreenshots(prev => prev.filter((_, i) => i !== idx));
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  // Screen recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: false,
      });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `screen-recording-${Date.now()}.webm`, { type: 'video/webm' });
        setFiles(prev => [...prev, file]);
        setRecording(false);
        setRecordingTime(0);
        clearInterval(recordingTimerRef.current);
      };

      // Auto-stop if user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 120) { // max 2 minutes
            mediaRecorderRef.current?.stop();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Screen recording failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    };
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() && !form.description.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        page_url: window.location.href,
        page_name: pageName,
        browser_info: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        os_info: navigator.platform || '',
        screenshots: screenshots.map(s => ({ data_url: s.data_url, caption: s.caption })),
      };
      const result = await api.submitFeedback(payload);

      // Upload additional file attachments
      if (files.length > 0 && result.feedback_id) {
        for (const file of files) {
          try {
            await api.uploadFeedbackAttachment(result.feedback_id, file, '');
          } catch (err) {
            console.warn('Failed to upload attachment:', err);
          }
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setStep(1);
        setForm({ ...INITIAL_FORM });
        setScreenshots([]);
        setFiles([]);
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Error al enviar feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setOpen(false);
    setStep(1);
    setForm({ ...INITIAL_FORM });
    setScreenshots([]);
    setFiles([]);
    setSubmitted(false);
    if (recording) stopRecording();
  };

  const selectedType = FEEDBACK_TYPES.find(t => t.value === form.feedback_type);

  // Short browser name
  const shortBrowser = (() => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Otro';
  })();

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-[280px] z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          title="Enviar Feedback"
        >
          <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg animate-pulse">
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium">Grabando pantalla — {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
          <button onClick={stopRecording} className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full hover:bg-white/30 text-xs font-medium">
            <StopCircle className="w-4 h-4" /> Detener
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={reset} onPaste={handlePaste}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg mx-0 sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Feedback</h3>
                {selectedType && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: selectedType.bg, color: selectedType.color }}>
                    {selectedType.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Paso {step}/3</span>
                <button onClick={reset} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Success */}
            {submitted && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Send className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Feedback enviado</h4>
                  <p className="text-sm text-gray-500 mt-1">Gracias por tu feedback</p>
                </div>
              </div>
            )}

            {/* Step 1: Type, Priority, Section, Impact */}
            {!submitted && step === 1 && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Tipo de Feedback</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEEDBACK_TYPES.map(ft => {
                      const Icon = ft.icon;
                      const selected = form.feedback_type === ft.value;
                      return (
                        <button key={ft.value} onClick={() => setF('feedback_type', ft.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${selected ? 'shadow-md' : 'hover:border-gray-300'}`}
                          style={{ borderColor: selected ? ft.color : '#e5e7eb', backgroundColor: selected ? ft.bg : 'white' }}>
                          <Icon className="w-5 h-5 mb-1" style={{ color: ft.color }} />
                          <div className="text-sm font-medium" style={{ color: selected ? ft.color : '#374151' }}>{ft.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button key={p.value} onClick={() => setF('priority', p.value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all ${form.priority === p.value ? 'text-white' : 'hover:border-gray-300'}`}
                        style={{
                          borderColor: form.priority === p.value ? p.color : '#e5e7eb',
                          backgroundColor: form.priority === p.value ? p.color : 'white',
                          color: form.priority === p.value ? 'white' : '#6B7280',
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">¿En que seccion?</label>
                  <select value={form.section} onChange={e => setF('section', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white">
                    <option value="">Seleccionar seccion...</option>
                    {APP_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">¿A quienes afecta?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPACT_LEVELS.map(il => (
                      <button key={il.value} onClick={() => setF('impact', il.value)}
                        className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all flex items-center gap-2 ${form.impact === il.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                        <span>{il.icon}</span>
                        {il.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {!submitted && step === 2 && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Titulo</label>
                  <input type="text" value={form.title} onChange={e => setF('title', e.target.value)}
                    placeholder="Resumen breve del feedback..."
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description detallada</label>
                  <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                    placeholder="Explica en detalle..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                </div>

                {/* Bug-specific fields */}
                {form.feedback_type === 'bug' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Pasos para reproducir</label>
                      <textarea value={form.steps_to_reproduce} onChange={e => setF('steps_to_reproduce', e.target.value)}
                        placeholder="1. Ir a...&#10;2. Click en...&#10;3. Se ve..."
                        rows={3}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Comportamiento esperado</label>
                        <textarea value={form.expected_behavior} onChange={e => setF('expected_behavior', e.target.value)}
                          placeholder="Que deberia pasar..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Comportamiento actual</label>
                        <textarea value={form.actual_behavior} onChange={e => setF('actual_behavior', e.target.value)}
                          placeholder="Que pasa realmente..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">¿Con que frecuencia ocurre?</label>
                      <div className="flex gap-2">
                        {FREQUENCIES.map(f => (
                          <button key={f.value} onClick={() => setF('frequency', f.value)}
                            className={`flex-1 py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all ${form.frequency === f.value ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Improvement-specific fields */}
                {form.feedback_type === 'improvement' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Comportamiento actual</label>
                      <textarea value={form.actual_behavior} onChange={e => setF('actual_behavior', e.target.value)}
                        placeholder="¿Como funciona ahora?"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Comportamiento deseado</label>
                      <textarea value={form.desired_behavior} onChange={e => setF('desired_behavior', e.target.value)}
                        placeholder="¿Como te gustaria que funcione?"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                    </div>
                  </div>
                )}

                {/* Suggestion-specific fields */}
                {form.feedback_type === 'suggestion' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Beneficio esperado</label>
                    <textarea value={form.expected_benefit} onChange={e => setF('expected_benefit', e.target.value)}
                      placeholder="¿Que beneficio traeria esta sugerencia?"
                      rows={2}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Valoracion general</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setF('rating', n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110">
                        <Star className={`w-7 h-7 ${n <= (hoverRating || form.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {form.rating === 1 ? 'Muy malo' : form.rating === 2 ? 'Malo' : form.rating === 3 ? 'Regular' : form.rating === 4 ? 'Bueno' : 'Excelente'}
                    </span>
                  </div>
                </div>

                {/* Contact email */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Email de contacto (opcional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.contact_email} onChange={e => setF('contact_email', e.target.value)}
                      placeholder="tu@email.com — para seguimiento"
                      className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Adjuntar evidencia (opcional)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button onClick={() => screenshotInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-emerald-400 text-xs text-gray-600 hover:text-emerald-600 transition-colors">
                      <Camera className="w-4 h-4" /> Imagen
                    </button>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-emerald-400 text-xs text-gray-600 hover:text-emerald-600 transition-colors">
                      <Paperclip className="w-4 h-4" /> Archivo
                    </button>
                    {!recording && typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia && (
                      <button onClick={startRecording}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-red-300 hover:border-red-400 text-xs text-gray-600 hover:text-red-600 transition-colors">
                        <Video className="w-4 h-4" /> Grabar pantalla
                      </button>
                    )}
                    <input ref={screenshotInputRef} type="file" accept="image/*" multiple onChange={handleScreenshotSelect} className="hidden" />
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden"
                      accept=".pdf,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp,.gif,.csv,.xlsx,.docx,.txt" />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Ctrl+V para pegar capturas de pantalla</p>
                  {screenshots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {screenshots.map((sc, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border group">
                          <img src={sc.preview} alt={`Screenshot ${idx + 1}`} className="w-full h-16 object-cover" />
                          <button onClick={() => removeScreenshot(idx)}
                            className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {files.length > 0 && (
                    <div className="space-y-1">
                      {files.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-50 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {f.type?.startsWith('video/') ? <Video className="w-3 h-3 text-red-400 flex-shrink-0" /> : <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                            <span className="truncate">{f.name}</span>
                            <span className="text-gray-400 flex-shrink-0">{f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)}KB` : `${(f.size / (1024 * 1024)).toFixed(1)}MB`}</span>
                          </div>
                          <button onClick={() => removeFile(idx)} className="p-0.5 hover:bg-red-100 rounded text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Environment info (collapsible) */}
                <div className="border rounded-xl overflow-hidden">
                  <button onClick={() => setShowEnvInfo(!showEnvInfo)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Info del entorno (se captura automaticamente)</span>
                    </div>
                    {showEnvInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showEnvInfo && (
                    <div className="px-3 pb-2 space-y-1 text-xs border-t">
                      <div className="flex justify-between py-1"><span className="text-gray-400">Navegador</span><span className="text-gray-600 font-mono">{shortBrowser}</span></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Pantalla</span><span className="text-gray-600 font-mono">{envInfo.screen}</span></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Dispositivo</span><span className="text-gray-600 font-mono">{envInfo.device}</span></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">OS</span><span className="text-gray-600 font-mono">{envInfo.os}</span></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Idioma</span><span className="text-gray-600 font-mono">{envInfo.language}</span></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">URL</span><span className="text-gray-600 font-mono truncate max-w-[200px]">{envInfo.url}</span></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {!submitted && step === 3 && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Resumen del feedback</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Tipo</span>
                    <span className="font-medium" style={{ color: selectedType?.color }}>{selectedType?.label}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Priority</span>
                    <span className="font-medium" style={{ color: PRIORITIES.find(p => p.value === form.priority)?.color }}>{PRIORITIES.find(p => p.value === form.priority)?.label}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Seccion</span>
                    <span className="font-medium">{form.section || pageName}</span>
                  </div>
                  {form.impact && (
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Impacto</span>
                      <span className="font-medium">{IMPACT_LEVELS.find(i => i.value === form.impact)?.icon} {IMPACT_LEVELS.find(i => i.value === form.impact)?.label}</span>
                    </div>
                  )}
                  {form.title && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Titulo</span>
                      <div className="font-medium">{form.title}</div>
                    </div>
                  )}
                  {form.description && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Description</span>
                      <div className="text-gray-700 whitespace-pre-wrap text-xs">{form.description}</div>
                    </div>
                  )}
                  {form.feedback_type === 'bug' && form.frequency && (
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Frecuencia</span>
                      <span className="font-medium">{FREQUENCIES.find(f => f.value === form.frequency)?.label}</span>
                    </div>
                  )}
                  {form.feedback_type === 'improvement' && form.desired_behavior && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Comportamiento deseado</span>
                      <div className="text-gray-700 whitespace-pre-wrap text-xs">{form.desired_behavior}</div>
                    </div>
                  )}
                  {form.feedback_type === 'suggestion' && form.expected_benefit && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Beneficio esperado</span>
                      <div className="text-gray-700 whitespace-pre-wrap text-xs">{form.expected_benefit}</div>
                    </div>
                  )}
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                  </div>
                  {form.contact_email && (
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Email contacto</span>
                      <span className="font-medium text-xs">{form.contact_email}</span>
                    </div>
                  )}
                  {(screenshots.length > 0 || files.length > 0) && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Adjuntos</span>
                      <div className="text-gray-700">
                        {screenshots.length > 0 && <span>{screenshots.length} captura(s)</span>}
                        {screenshots.length > 0 && files.length > 0 && <span>, </span>}
                        {files.length > 0 && <span>{files.length} archivo(s) ({files.filter(f => f.type?.startsWith('video/')).length > 0 ? 'incl. video' : ''})</span>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Se capturara automaticamente: URL, navegador ({shortBrowser}), pantalla ({envInfo.screen}), dispositivo ({envInfo.device})</span>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            {!submitted && (
              <div className="border-t p-4 flex justify-between items-center bg-white">
                <div>
                  {step > 1 && (
                    <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Atras
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {step < 3 && (
                    <button onClick={() => setStep(s => s + 1)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                      Next
                    </button>
                  )}
                  {step === 3 && (
                    <button onClick={handleSubmit} disabled={submitting || (!form.title.trim() && !form.description.trim())}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {submitting ? 'Enviando...' : 'Enviar Feedback'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
