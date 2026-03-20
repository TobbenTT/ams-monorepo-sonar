import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus, X, Star, Upload, Camera, Trash2, Bug, Lightbulb, HelpCircle, Wrench, Send, Paperclip, Image } from 'lucide-react';
import * as api from '../api';

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


const INITIAL_FORM = {
  feedback_type: 'suggestion',
  priority: 'medium',
  title: '',
  description: '',
  rating: 3,
  section: '',
  component: '',
  steps_to_reproduce: '',
  expected_behavior: '',
  actual_behavior: '',
};

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: type, 2: details+attachments, 3: confirm
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [screenshots, setScreenshots] = useState([]); // [{data_url, caption, preview}]
  const [files, setFiles] = useState([]); // File objects for post-submit upload
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const fileInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const location = useLocation();

  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Auto-detect page info
  const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.replace(/^\//, '').replace(/-/g, ' ');

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
      alert(err.message || 'Error al enviar feedback');
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
  };

  const selectedType = FEEDBACK_TYPES.find(t => t.value === form.feedback_type);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          title="Enviar Feedback"
        >
          <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
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

            {/* Step 1: Type & Priority */}
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
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Prioridad</label>
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
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Descripcion detallada</label>
                  <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                    placeholder="Explica en detalle..."
                    rows={4}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">¿Donde en la pagina?</label>
                  <input type="text" value={form.section} onChange={e => setF('section', e.target.value)}
                    placeholder="Ej: tabla principal, boton verde arriba, menu lateral, grafico de barras..."
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                </div>
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
                  </>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Componente especifico (opcional)</label>
                  <input type="text" value={form.component} onChange={e => setF('component', e.target.value)}
                    placeholder="Ej: Boton guardar, Tabla de datos, Menu lateral..."
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                </div>
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

                {/* Attachments inline */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Adjuntar imagenes / archivos (opcional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => screenshotInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-emerald-400 text-xs text-gray-600 hover:text-emerald-600 transition-colors">
                      <Camera className="w-4 h-4" /> Imagen
                    </button>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-emerald-400 text-xs text-gray-600 hover:text-emerald-600 transition-colors">
                      <Paperclip className="w-4 h-4" /> Archivo
                    </button>
                    <input ref={screenshotInputRef} type="file" accept="image/*" multiple onChange={handleScreenshotSelect} className="hidden" />
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden"
                      accept=".pdf,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp,.gif,.csv,.xlsx,.docx,.txt" />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Tambien puedes pegar (Ctrl+V) una captura de pantalla</p>
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
                            <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{f.name}</span>
                            <span className="text-gray-400 flex-shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                          </div>
                          <button onClick={() => removeFile(idx)} className="p-0.5 hover:bg-red-100 rounded text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
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
                    <span className="text-gray-500">Prioridad</span>
                    <span className="font-medium">{PRIORITIES.find(p => p.value === form.priority)?.label}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Pagina</span>
                    <span className="font-medium">{pageName}{form.section ? ` > ${form.section}` : ''}</span>
                  </div>
                  {form.title && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Titulo</span>
                      <div className="font-medium">{form.title}</div>
                    </div>
                  )}
                  {form.description && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Descripcion</span>
                      <div className="text-gray-700 whitespace-pre-wrap">{form.description}</div>
                    </div>
                  )}
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                  </div>
                  {(screenshots.length > 0 || files.length > 0) && (
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-xs">Adjuntos</span>
                      <div className="text-gray-700">{screenshots.length} screenshot(s), {files.length} archivo(s)</div>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  Se capturara automaticamente: URL, navegador, resolucion de pantalla, dispositivo
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
                      Siguiente
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
