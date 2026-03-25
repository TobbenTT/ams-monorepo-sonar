import { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, Loader2, ArrowRight, X, Mic, MicOff, Camera, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

const PRIORITY_OPTIONS = [
  { value: 'P1', label: 'P1 - Urgente', desc: '< 24h', color: 'border-red-300 bg-red-50 text-red-700', ring: 'ring-red-200' },
  { value: 'P2', label: 'P2 - Alta',    desc: '< 7 días',                  color: 'border-orange-300 bg-orange-50 text-orange-700', ring: 'ring-orange-200' },
  { value: 'P3', label: 'P3 - Media',   desc: '> 7 días',                  color: 'border-yellow-300 bg-yellow-50 text-yellow-700', ring: 'ring-yellow-200' },
  { value: 'P4', label: 'P4 - Baja',    desc: 'Parada de Planta',              color: 'border-blue-300 bg-blue-50 text-blue-700', ring: 'ring-blue-200' },
];

const FAILURE_TYPES = [
  { value: 'MECANICO',        label: 'Mecanico' },
  { value: 'ELECTRICO',       label: 'Electrico' },
  { value: 'INSTRUMENTACION', label: 'Instrumentacion' },
  { value: 'PROCESO',         label: 'Proceso' },
];

const SHIFT_OPTIONS = [
  { value: 'MANANA', label: 'Manana' },
  { value: 'TARDE',  label: 'Tarde' },
  { value: 'NOCHE',  label: 'Noche' },
];

const PLANT_CONDITIONS = [
  { value: 'operating', label: 'Operando',  color: '#22c55e' },
  { value: 'stopped',   label: 'Parado',    color: '#ef4444' },
];

const SpeechRecognition = typeof window !== "undefined"
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function FailureCapture({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  // Form state
  const [form, setForm] = useState({
    equipment_tag: '',
    location: '',
    failure_type: '',
    priority: '',
    description: '',
    reported_by: user?.name || user?.username || 'Ing. Confiabilidad',
    date_time: new Date().toISOString().slice(0, 16),
    area: '',
    shift: '',
    notes: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [plantCondition, setPlantCondition] = useState('operating');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const cameraRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [equipSearch, setEquipSearch] = useState('');
  const [showEquipDropdown, setShowEquipDropdown] = useState(false);

  // Lookup data
  const [equipment, setEquipment] = useState([]);
  const [locations, setLocations] = useState([]);
  const [failureTypes, setFailureTypes] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' }),
      api.listNodes({ plant_id: plant, node_type: 'AREA' }),
      api.getFailureCategories(),
    ]).then(([eqRes, areaRes, catRes]) => {
      const eqList = eqRes.status === 'fulfilled' ? (Array.isArray(eqRes.value) ? eqRes.value : []) : [];
      setEquipment(eqList);
      // Build locations from equipment parent systems
      const locs = [...new Set(eqList.map(e => e.parent_node_id || '').filter(Boolean))];
      setLocations(locs);
      const areaList = areaRes.status === 'fulfilled' ? (Array.isArray(areaRes.value) ? areaRes.value : []) : [];
      setAreas(areaList);
      const cats = catRes.status === 'fulfilled' ? (Array.isArray(catRes.value) ? catRes.value : []) : [];
      setFailureTypes(cats);
    });
  }, [plant]);

  useEffect(() => {
    if (plantCondition === 'stopped') {
      setForm(prev => ({ ...prev, priority: 'P1' }));
    }
  }, [plantCondition]);

  const filteredEquipment = useMemo(() => {
    if (!equipSearch.trim()) return equipment.slice(0, 50);
    const q = equipSearch.toLowerCase();
    return equipment.filter(eq => {
      const tag = (eq.tag || eq.code || '').toLowerCase();
      const name = (eq.name || '').toLowerCase();
      return tag.includes(q) || name.includes(q);
    }).slice(0, 30);
  }, [equipment, equipSearch]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleVoice = () => {
    if (!SpeechRecognition) { toast.error('Navegador no soporta reconocimiento de voz.'); return; }
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    baseTextRef.current = form.description;
    let finalTranscript = '';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const tr = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += tr + ' ';
        else interim += tr;
      }
      const base = baseTextRef.current;
      const sep = base ? '\n' : '';
      set('description', (base + sep + finalTranscript + interim).trimEnd());
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        const base = baseTextRef.current;
        const sep = base ? '\n' : '';
        set('description', (base + sep + finalTranscript).trimEnd());
      }
    };
    recognition.start();
  };

  const handleCameraClick = () => cameraRef.current?.click();
  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotos(prev => [...prev, ev.target.result]);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const selectEquipment = (eq) => {
    const tag = eq.tag || eq.code;
    set('equipment_tag', tag);
    setEquipSearch(tag + ' — ' + (eq.name || ''));
    setShowEquipDropdown(false);
    if (eq.parent_node_id) set('location', eq.parent_node_id);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { toast.error('Maximo 10MB por archivo'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { toast.error('Maximo 10MB por archivo'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.equipment_tag) { toast.error('Equipo / Activo es obligatorio'); return; }
    if (!form.location) { toast.error('Ubicacion es obligatoria'); return; }
    if (!form.failure_type) { toast.error('Tipo de Falla es obligatorio'); return; }
    if (!form.priority) { toast.error('Prioridad es obligatoria'); return; }
    if (!form.description.trim()) { toast.error('Descripcion es obligatoria'); return; }

    setSubmitting(true);
    try {
      const eqObj = equipment.find(e => e.tag === form.equipment_tag || e.code === form.equipment_tag);
      const result = await api.createWRManual({
        equipment_tag: form.equipment_tag,
        equipment_name: eqObj?.name || form.equipment_tag,
        plant_id: plant || 'OCP-JFC1',
        problem_description: form.description,
        priority: form.priority,
        failure_category: form.failure_type,
        suggested_action: form.notes || '',
        estimated_duration: form.priority === 'P1' ? 8 : form.priority === 'P2' ? 6 : 4,
        reported_by: form.reported_by,
        circumstances: 'Ubicacion: ' + form.location + ' | Area: ' + form.area + ' | Turno: ' + form.shift + ' | Planta: ' + (plantCondition === 'stopped' ? 'PARADO' : 'Operando'),
        created_by: user?.user_id || user?.username || '',
        materials: [],
        resources: [],
        documents: [
        ...attachments.map(att => ({ name: att.name, data: att.data, type: 'file' })),
        ...photos.map((p, i) => ({ name: 'foto_' + (i + 1) + '.jpg', data: p, type: 'photo' })),
      ],
      });



      const wrId = result?.work_request_id || result?.request_id || '';
      toast.success('Reporte enviado — Aviso ' + wrId.slice(0, 8) + ' creado');

      // Reset form
      setForm({
        equipment_tag: '', location: '', failure_type: '', priority: '',
        description: '', reported_by: form.reported_by,
        date_time: new Date().toISOString().slice(0, 16),
        area: '', shift: '', notes: '',
      });
      setPlantCondition('operating');
      setAttachments([]);
      setPhotos([]);
      setEquipSearch('');

      // Navigate to Identification tab
      if (onNavigateTab) onNavigateTab('identification');
    } catch (e) {
      toast.error('Error: ' + (e.message || 'No se pudo enviar'));
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setForm({
      equipment_tag: '', location: '', failure_type: '', priority: '',
      description: '', reported_by: form.reported_by,
      date_time: new Date().toISOString().slice(0, 16),
      area: '', shift: '', notes: '',
    });
    setPlantCondition('operating');
    setAttachments([]);
    setPhotos([]);
    setEquipSearch('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nuevo Reporte de Falla</h2>
            <p className="text-sm text-gray-500 mt-1">Complete todos los campos requeridos para generar un Aviso (WR)</p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            Se creará Aviso automáticamente
          </span>
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-6">

          {/* Equipment (Searchable) */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Equipo / Activo *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Buscar equipo por tag o nombre..."
                value={equipSearch}
                onChange={e => { setEquipSearch(e.target.value); setShowEquipDropdown(true); if (!e.target.value) set("equipment_tag", ""); }}
                onFocus={() => setShowEquipDropdown(true)}
              />
              {form.equipment_tag && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500" onClick={() => { set("equipment_tag", ""); setEquipSearch(""); }}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showEquipDropdown && filteredEquipment.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredEquipment.map((eq, i) => (
                  <button key={i} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 flex justify-between"
                    onClick={() => selectEquipment(eq)}>
                    <span className="font-mono text-emerald-700">{eq.tag || eq.code}</span>
                    <span className="text-gray-500 truncate ml-2">{eq.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ubicacion + Fecha */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ubicación *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.location} onChange={e => set("location", e.target.value)}>
                <option value="">Seleccionar ubicación...</option>
                {locations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                {locations.length === 0 && areas.map((a, i) => <option key={i} value={a.name || a.code}>{a.name || a.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha y Hora</label>
              <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.date_time} onChange={e => set("date_time", e.target.value)} />
            </div>
          </div>

          {/* Condicion de Planta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Condición de Planta</label>
            <div className="flex gap-3">
              {PLANT_CONDITIONS.map(pc => (
                <button key={pc.value} type="button"
                  onClick={() => setPlantCondition(pc.value)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    plantCondition === pc.value
                      ? (pc.value === "stopped" ? "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-200" : "border-green-400 bg-green-50 text-green-700 ring-2 ring-green-200")
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pc.color }} />
                  {pc.label}
                  {pc.value === "stopped" && plantCondition === "stopped" && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </button>
              ))}
            </div>
            {plantCondition === "stopped" && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Planta parada: prioridad forzada a P1
              </p>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prioridad *</label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => { if (plantCondition !== "stopped") set("priority", opt.value); }}
                  className={`px-3 py-2.5 rounded-lg text-center border-2 transition-all ${
                    form.priority === opt.value
                      ? opt.color + " ring-2 ring-offset-1 " + opt.ring
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  } ${plantCondition === "stopped" && opt.value !== "P1" ? "opacity-40 cursor-not-allowed" : ""}`}>
                  <div className="text-sm font-bold">{opt.value}</div>
                  <div className="text-xs opacity-75">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Falla */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Falla *</label>
            <div className="grid grid-cols-4 gap-2">
              {(failureTypes.length > 0 ? failureTypes : FAILURE_TYPES).map((ft, i) => {
                const val = ft.category || ft.code || ft.value;
                const lab = ft.label || ft.category || ft.name;
                return (
                  <button key={i} type="button"
                    onClick={() => set("failure_type", val)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      form.failure_type === val
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                    {lab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area + Turno */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Área</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.area} onChange={e => set("area", e.target.value)}>
                <option value="">Seleccionar...</option>
                {areas.map((a, i) => <option key={i} value={a.name || a.code}>{a.name || a.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Turno</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.shift} onChange={e => set("shift", e.target.value)}>
                <option value="">Seleccionar...</option>
                {SHIFT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Descripcion + Voice + Camera */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Descripción *</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleVoice}
                  className={`p-1.5 rounded-lg transition-all ${isRecording ? "bg-red-100 text-red-600 animate-pulse ring-2 ring-red-300" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  title={isRecording ? "Detener grabación" : "Dictar descripción"}>
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button type="button" onClick={handleCameraClick}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                  title="Tomar foto">
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraChange} />
              </div>
            </div>
            {isRecording && (
              <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Grabando... hable ahora
              </div>
            )}
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describa la falla en detalle... (puede dictar con el micrófono)"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>

            {/* Photo strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={p} alt={"Foto " + (i+1)} className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adjuntos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adjuntos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer"
              onDragOver={e => e.preventDefault()} onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}>
              <input id="file-input" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
              <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-500">Arrastra archivos o haz clic para subir</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF (máx 10MB)</p>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                    <span className="truncate">{att.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas Adicionales</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Notas opcionales..."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
            />
          </div>

          {/* Reportado por */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reportado por</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.reported_by} onChange={e => set("reported_by", e.target.value)} />
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400">* Campos obligatorios</p>
          <div className="flex items-center gap-3">
            <button onClick={handleCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                : <>Enviar Reporte <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
