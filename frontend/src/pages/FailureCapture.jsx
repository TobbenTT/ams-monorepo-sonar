import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, Loader2, ArrowRight, X, Mic, MicOff, Camera, AlertTriangle, Search, ChevronDown, Clock, Package, Wrench, Users, MapPin, CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function FailureCapture({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  // ── SAP PM Constants ──
  const PLANT_CONDITIONS = [
    { value: 'operating', label: 'Operando', color: '#10B981' },
    { value: 'stopped', label: 'Parado', color: '#EF4444' },
  ];

  const PRIORITIES = [
    { value: 'P1', label: 'P1 - Urgente', sub: '< 24h', color: '#EF4444', bg: '#FEE2E2', claseOT: 'PM03' },
    { value: 'P2', label: 'P2 - Alta', sub: '< 7 dias', color: '#F97316', bg: '#FED7AA', claseOT: 'PM03' },
    { value: 'P3', label: 'P3 - Media', sub: '> 7 dias', color: '#EAB308', bg: '#FEF3C7', claseOT: 'PM01' },
    { value: 'P4', label: 'P4 - Parada de Planta', sub: 'Programada', color: '#3B82F6', bg: '#DBEAFE', claseOT: 'PM01' },
  ];

  const ACTIVITY_CLASSES = {
    PM01: [
      { value: 'CR', label: 'Correctivo' },
      { value: 'MC', label: 'Monitoreo Condicion' },
      { value: 'MJ', label: 'Mejora' },
      { value: 'IO', label: 'Incidente Operacional' },
    ],
    PM03: [
      { value: 'CR', label: 'Correctivo' },
      { value: 'IP', label: 'Imprevisto' },
      { value: 'IO', label: 'Incidente Operacional' },
    ],
  };

  const FAILURE_CATALOG = {
    MECANICO: {
      label: 'Mecanico', color: '#6366F1',
      symptoms: ['ALTA VIBRACION', 'ALTA TEMPERATURA', 'RUIDO ANORMAL', 'TRABADO', 'SIN FLUJO', 'FILTRACION', 'DESGASTE VISIBLE', 'FUGA ACEITE', 'ATASCAMIENTO'],
      parts: ['RODAMIENTOS', 'SELLOS MECANICOS', 'ACOPLES', 'EJES', 'ENGRANAJES', 'CORREAS', 'BOMBAS', 'VALVULAS', 'FILTROS'],
      causes: ['DESGASTE', 'FALTA LUBRICACION', 'CORROSION', 'DESALINEADO', 'OBSTRUIDO', 'SOBRECARGA', 'FATIGA', 'MONTAJE INCORRECTO'],
    },
    ELECTRICO: {
      label: 'Electrico', color: '#F59E0B',
      symptoms: ['NO ARRANCA', 'SOBRECALENTAMIENTO', 'CORTOCIRCUITO', 'DISPARO PROTECCION', 'BAJA AISLACION', 'OPERACION INTERMITENTE', 'CONSUMO EXCESIVO'],
      parts: ['MOTOR ELECTRICO', 'CABLES / CONDUCTORES', 'PROTECCIONES', 'TABLERO ELECTRICO', 'VARIADOR FRECUENCIA', 'CONTACTOR'],
      causes: ['PERDIDA AISLACION', 'DESGASTE', 'SUELTO', 'SOBRECARGA ELECTRICA', 'HUMEDAD', 'CALENTAMIENTO EXCESIVO'],
    },
    INSTRUMENTACION: {
      label: 'Instrumentacion', color: '#06B6D4',
      symptoms: ['LECTURA ERRONEA', 'SIN SENAL', 'SENAL INESTABLE', 'NO RESPONDE', 'ALARMA FALSA', 'COMUNICACION PERDIDA'],
      parts: ['SENSOR / TRANSDUCTOR', 'TRANSMISOR', 'VALVULA DE CONTROL', 'PLC / DCS', 'ACTUADOR', 'POSICIONADOR'],
      causes: ['DESCALIBRADO', 'CONTAMINADO', 'PERDIDA PARAMETROS', 'PERDIDA COMUNICACION', 'OBSTRUCCION'],
    },
  };

  const SPECIAL_EQUIPMENT = [
    'Grua 20 Ton', 'Grua 50 Ton', 'Grua Horquilla', 'Andamio Multidireccional',
    'Andamio Tubular', 'Camion Pluma', 'Plataforma Elevadora', 'Soldadora MIG/MAG',
    'Soldadora TIG', 'Soldadora Arco', 'Compresor Portatil', 'Generador Electrico',
    'Bomba Sumergible', 'Hidrolavadora', 'Equipo Alineacion Laser',
    'Analizador de Vibraciones', 'Camara Termografica', 'Megohmetro',
    'Multimetro Industrial', 'Torquimetro', 'Extractor Hidraulico',
    'Gata Hidraulica', 'Tecle Cadena 5 Ton', 'Esmeril Angular',
    'Taladro Magnetico', 'Equipo Ultrasonido', 'Detector de Gases',
  ];

  const RESOURCE_TYPES = [
    'Mecanico', 'Electrico', 'Instrumentista', 'Lubricador', 'Soldador',
    'Operador Grua', 'Andamiero', 'Calderero', 'Ayudante General', 'Supervisor',
  ];

  const COMMON_MATERIALS = [
    { sapId: '10001234', desc: 'Rodamiento SKF 6205' },
    { sapId: '10001235', desc: 'Sello mecanico' },
    { sapId: '10001236', desc: 'Correa V A-68' },
    { sapId: '10001237', desc: 'Aceite ISO 68' },
    { sapId: '10001238', desc: 'Grasa EP2' },
    { sapId: '10001239', desc: 'Filtro aceite hidraulico' },
    { sapId: '10001240', desc: 'Junta torica NBR' },
    { sapId: '10001241', desc: 'Tornillo M12x50 Gr8.8' },
    { sapId: '10001242', desc: 'Electrodo E7018 3/32' },
    { sapId: '10001243', desc: 'Cable 3x10 AWG' },
    { sapId: '10001244', desc: 'Fusible NH 100A' },
    { sapId: '10001245', desc: 'Contactor 3P 40A' },
    { sapId: '10001246', desc: 'Sensor proximidad inductivo' },
    { sapId: '10001247', desc: 'Transmisor presion 0-10bar' },
    { sapId: '10001248', desc: 'Valvula solenoide 1/2"' },
  ];

  // ── Form State ──
  const [form, setForm] = useState({
    whatHappens: '',
    whereTag: '',
    technicalLocation: '',
    technicalLocationCode: '',
    suggestedAction: '',
    estimatedDuration: '',
    priority: 'P3',
    activityClass: 'CR',
    plantCondition: 'operating',
    failureCategory: 'MECANICO',
    failureSymptom: '',
    failureObjectPart: '',
    failureCause: '',
    resources: [],
    materials: [],
    specialEquipment: '',
    circumstances: '',
    reportedBy: user?.name || user?.username || '',
    supportEquipment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1=Ubicacion, 2=Falla, 3=Accion
  const [createdWRId, setCreatedWRId] = useState(null);

  // Equipment search
  const [equipSearch, setEquipSearch] = useState('');
  const [allEquipment, setAllEquipment] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [locationNodes, setLocationNodes] = useState([]);
  const [equipResults, setEquipResults] = useState([]);
  const [showEquipSearch, setShowEquipSearch] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);

  // Location search
  const [locSearch, setLocSearch] = useState('');
  const [locResults, setLocResults] = useState([]);
  const [showLocSearch, setShowLocSearch] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);

  // Failure catalog dropdowns
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const [showCauses, setShowCauses] = useState(false);

  // Resource/Material inline autocomplete
  const [activeResTypeIdx, setActiveResTypeIdx] = useState(-1);
  const [activeMatSapIdx, setActiveMatSapIdx] = useState(-1);
  const [showSpecEquip, setShowSpecEquip] = useState(false);

  // Voice + Photo
  const [isRecording, setIsRecording] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const cameraRef = useRef(null);

  const setF = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // ── Load equipment + location nodes ──
  const buildFuncLocPath = useCallback((node, nodeMap) => {
    const parts = [];
    let current = node;
    while (current) {
      parts.unshift(current.code || current.name || '');
      current = current.parent_node_id ? nodeMap[current.parent_node_id] : null;
    }
    return parts.join('-');
  }, []);

  useEffect(() => {
    api.listNodes({}).then(res => {
      const nodes = Array.isArray(res) ? res : res?.items || [];
      setAllNodes(nodes);
      const nodeMap = {};
      nodes.forEach(n => { nodeMap[n.node_id] = n; });
      setAllEquipment(nodes.filter(n => n.node_type === 'EQUIPMENT'));
      setLocationNodes(nodes.filter(n =>
        ['PLANT', 'AREA', 'SYSTEM'].includes(n.node_type)
      ).map(n => ({ ...n, _funcLoc: buildFuncLocPath(n, nodeMap) })));
    }).catch(() => {});
  }, [buildFuncLocPath]);

  // Filter equipment results
  useEffect(() => {
    if (equipSearch.length < 2) { setEquipResults([]); return; }
    const q = equipSearch.toLowerCase();
    setEquipResults(allEquipment.filter(n =>
      (n.tag || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [equipSearch, allEquipment]);

  // Filter location results
  useEffect(() => {
    if (locSearch.length < 2) { setLocResults([]); return; }
    const q = locSearch.toLowerCase();
    setLocResults(locationNodes.filter(n =>
      (n._funcLoc || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [locSearch, locationNodes]);

  // Auto-detect equipment tag from description
  useEffect(() => {
    if (selectedEquip || !form.whatHappens || allEquipment.length === 0) return;
    const text = form.whatHappens.toUpperCase();
    const found = allEquipment.find(n => {
      const tag = (n.tag || n.code || '').toUpperCase();
      return tag && tag.length >= 4 && text.includes(tag);
    });
    if (found) { selectEquip(found); return; }
    const tagMatch = form.whatHappens.match(/\b([A-Z]{1,5}(?:-[A-Z0-9]{1,6}){1,5})\b/i);
    if (tagMatch) {
      const extracted = tagMatch[1].toUpperCase();
      const partial = allEquipment.find(n => {
        const tag = (n.tag || n.code || '').toUpperCase();
        return tag && (tag.includes(extracted) || extracted.includes(tag));
      });
      if (partial) selectEquip(partial);
      else selectEquip({ tag: extracted, name: 'Detectado del texto' });
    }
  }, [form.whatHappens, allEquipment, selectedEquip]);

  // When plant is stopped, force P1
  useEffect(() => {
    if (form.plantCondition === 'stopped' && form.priority !== 'P1') {
      setF('priority', 'P1');
      setF('activityClass', ACTIVITY_CLASSES['PM03']?.[0]?.value || 'CR');
    }
  }, [form.plantCondition]);

  // ── Equipment selection ──
  const selectEquip = (node) => {
    setSelectedEquip(node);
    setF('whereTag', node.tag || node.code || '');
    setEquipSearch('');
    setShowEquipSearch(false);
    // Auto-find location
    if (node.parent_node_id && locationNodes.length > 0) {
      const nodeMap = {};
      allNodes.forEach(n => { nodeMap[n.node_id] = n; });
      let locNode = nodeMap[node.parent_node_id];
      if (locNode) {
        const funcLoc = buildFuncLocPath(locNode, nodeMap);
        setSelectedLoc(locNode);
        setF('technicalLocation', locNode.name || '');
        setF('technicalLocationCode', funcLoc);
      }
    }
  };

  const selectLocation = (node) => {
    setSelectedLoc(node);
    setF('technicalLocation', node.name || '');
    setF('technicalLocationCode', node._funcLoc || node.code || '');
    setShowLocSearch(false);
    setLocSearch('');
  };

  const clearLocation = () => {
    setSelectedLoc(null);
    setF('technicalLocation', '');
    setF('technicalLocationCode', '');
    setLocSearch('');
  };

  // ── Voice ──
  const handleVoice = () => {
    if (!SpeechRecognition) { toast.error('Navegador no soporta reconocimiento de voz'); return; }
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    baseTextRef.current = form.whatHappens;
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
      setF('whatHappens', (base + sep + finalTranscript + interim).trimEnd());
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        const base = baseTextRef.current;
        const sep = base ? '\n' : '';
        setF('whatHappens', (base + sep + finalTranscript).trimEnd());
      }
    };
    recognition.start();
  };

  // ── Camera ──
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

  // ── File Attachments ──
  const handleFileChange = (e) => {
    Array.from(e.target.files || []).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { toast.error('Maximo 10MB por archivo'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
  };
  const handleDrop = (e) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { toast.error('Maximo 10MB por archivo'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  // ── Resources CRUD ──
  const addResource = () => setF('resources', [...form.resources, { type: '', quantity: '1', hours: '' }]);
  const updateResource = (i, field, value) => {
    const updated = [...form.resources];
    updated[i] = { ...updated[i], [field]: value };
    setF('resources', updated);
  };
  const removeResource = (i) => setF('resources', form.resources.filter((_, idx) => idx !== i));

  // ── Materials CRUD ──
  const addMaterial = () => setF('materials', [...form.materials, { sapId: '', quantity: '1', description: '' }]);
  const updateMaterial = (i, field, value) => {
    const updated = [...form.materials];
    updated[i] = { ...updated[i], [field]: value };
    setF('materials', updated);
  };
  const removeMaterial = (i) => setF('materials', form.materials.filter((_, idx) => idx !== i));

  // ── Derived values ──
  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);
  const claseOT = selectedPriority?.claseOT || 'PM01';
  const actClasses = ACTIVITY_CLASSES[claseOT] || [];
  const canSubmit = form.whatHappens.trim() && form.whereTag.trim();

  // ── Submit ──
  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.createWRManual({
        equipment_tag: form.whereTag.trim(),
        equipment_name: selectedEquip?.name || form.whereTag.trim(),
        plant_id: plant || 'OCP-JFC1',
        problem_description: form.whatHappens.trim(),
        priority: form.priority,
        activity_class: form.activityClass || '',
        failure_category: form.failureCategory || '',
        failure_symptom: form.failureSymptom || '',
        failure_object_part: form.failureObjectPart || '',
        failure_cause: form.failureCause || '',
        plant_condition: form.plantCondition || '',
        suggested_action: form.suggestedAction || '',
        estimated_duration: parseFloat(form.estimatedDuration) || 4,
        materials: (form.materials || []).map(m => typeof m === 'string' ? m : m.description || m.sapId || '').filter(Boolean),
        resources: (form.resources || []).map(r => typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1}`).filter(Boolean),
        documents: [
          ...photos.map((data, i) => ({ name: `foto_${i + 1}.jpg`, data, type: 'photo' })),
          ...attachments.map(att => ({ name: att.name, data: att.data, type: 'file' })),
        ],
        circumstances: form.circumstances || '',
        reported_by: form.reportedBy || '',
        support_equipment: form.supportEquipment ? form.supportEquipment.split(',').map(s => s.trim()).filter(Boolean) : [],
        technical_location: form.technicalLocationCode || '',
        notification_type: 'A1',
        created_by: user?.user_id || user?.username || '',
      });
      const wrId = res?.request_id || res?.work_request_id || '';
      setCreatedWRId(wrId);
      toast.success('Aviso creado: ' + wrId.slice(0, 13));
    } catch (err) {
      toast.error(err.message || 'Error al crear aviso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      whatHappens: '', whereTag: '', technicalLocation: '', technicalLocationCode: '',
      suggestedAction: '', estimatedDuration: '', priority: 'P3', activityClass: 'CR',
      plantCondition: 'operating', failureCategory: 'MECANICO', failureSymptom: '',
      failureObjectPart: '', failureCause: '', resources: [], materials: [],
      specialEquipment: '', circumstances: '', reportedBy: form.reportedBy, supportEquipment: '',
    });
    setSelectedEquip(null);
    setSelectedLoc(null);
    setPhotos([]);
    setAttachments([]);
    setCreatedWRId(null);
  };

  // ── Success popup ──
  if (createdWRId) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aviso Creado</h3>
          <p className="text-sm text-gray-500 mb-4">Tu aviso ha sido enviado para revision</p>
          <div className="inline-block px-4 py-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 mb-6">
            <div className="text-xs text-emerald-600 font-medium">ID</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{createdWRId.slice(0, 13)}</div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { handleReset(); }} className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Crear Otro
            </button>
            <button onClick={() => { setCreatedWRId(null); if (onNavigateTab) onNavigateTab('identification'); }} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
              Ver Avisos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Crear Aviso de Trabajo</h2>
              <p className="text-xs text-gray-500 mt-0.5">Formulario SAP PM - Notificacion de Averia / Solicitud de Trabajo</p>
            </div>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              Se creara Aviso (WR)
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Wizard Stepper */}
          <div className="flex items-center justify-between mb-6 px-2">
            {[
              { step: 1, label: 'Ubicacion', icon: '\ud83d\udccd', desc: 'Donde ocurrio' },
              { step: 2, label: 'Falla', icon: '\u26a0\ufe0f', desc: 'Que paso' },
              { step: 3, label: 'Accion', icon: '\ud83d\udd27', desc: 'Que hacer' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center flex-1">
                <button type="button" onClick={() => setWizardStep(s.step)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all w-full ${
                    wizardStep === s.step
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : wizardStep > s.step
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                  <span className="text-lg">{s.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold">Paso {s.step}: {s.label}</div>
                    <div className="text-[10px] opacity-70">{s.desc}</div>
                  </div>
                  {wizardStep > s.step && <span className="ml-auto text-emerald-600">✓</span>}
                </button>
                {i < 2 && <div className={`w-8 h-0.5 mx-1 flex-shrink-0 ${wizardStep > s.step + 1 ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Hidden camera input */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleCameraChange} className="hidden" />

          <div style={{display: wizardStep === 2 ? undefined : "none"}}>
          {/* 1. Que paso? + Voice / Camera */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Que paso?</label>
              <div className="flex gap-2">
                {SpeechRecognition ? (
                  <button type="button" onClick={handleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${isRecording ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? 'Grabando...' : 'Voz'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" title="Requiere HTTPS">
                    <Mic className="w-3.5 h-3.5" /> Voz
                  </span>
                )}
                <button type="button" onClick={handleCameraClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                  <Camera className="w-3.5 h-3.5" /> Foto
                </button>
              </div>
            </div>
            <textarea
              value={form.whatHappens}
              onChange={e => setF('whatHappens', e.target.value)}
              placeholder="Describa el problema, averia o solicitud de trabajo..."
              rows={3}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none ${isRecording ? 'border-red-400 bg-red-50/30' : 'border-gray-300'}`}
            />
            {/* Photo strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={photo} alt={`Foto ${i+1}`} className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200" />
                    <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={handleCameraClick} className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">+</span>
                </button>
              </div>
            )}
          </div>

          </div>
          <div style={{display: wizardStep === 1 ? undefined : "none"}}>
          {/* 2. Condicion de Planta + Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Condicion de Planta</label>
              <div className="grid grid-cols-2 gap-2">
                {PLANT_CONDITIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => {
                      setF('plantCondition', opt.value);
                      if (opt.value === 'stopped' && form.priority !== 'P1') {
                        setF('priority', 'P1');
                        setF('activityClass', ACTIVITY_CLASSES['PM03']?.[0]?.value || 'CR');
                      }
                    }}
                    className="p-2.5 rounded-xl border-2 transition-all text-sm font-bold"
                    style={{
                      borderColor: form.plantCondition === opt.value ? opt.color : '#e5e7eb',
                      backgroundColor: form.plantCondition === opt.value ? opt.color + '15' : 'transparent',
                      color: form.plantCondition === opt.value ? opt.color : '#64748B',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Prioridad</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.value}
                    onClick={() => { setF('priority', p.value); setF('activityClass', ACTIVITY_CLASSES[p.claseOT]?.[0]?.value || 'CR'); }}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 text-center transition-all ${form.priority === p.value ? 'scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                    style={{ borderColor: form.priority === p.value ? p.color : '#e5e7eb', backgroundColor: form.priority === p.value ? p.bg : 'transparent' }}>
                    <div className="text-sm font-bold" style={{ color: p.color }}>{p.value}</div>
                    <div className="text-[9px] text-gray-500 leading-tight">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown alert */}
          {form.plantCondition === 'stopped' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-medium">Equipo detenido - Prioridad ajustada a P1 (Urgente). Clase OT: PM03 No Programado.</span>
            </div>
          )}

          {/* 3. Donde? TAG equipo */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Equipo / TAG *</label>
            {!selectedEquip ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={equipSearch}
                  onChange={e => { setEquipSearch(e.target.value); setShowEquipSearch(true); }}
                  onFocus={() => equipSearch.length >= 2 && setShowEquipSearch(true)}
                  placeholder="Buscar por TAG, codigo o nombre de equipo..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                {equipSearch.length >= 2 && equipResults.length === 0 && (
                  <button onClick={() => selectEquip({ tag: equipSearch, name: `${equipSearch} (No catalogado)` })}
                    className="w-full mt-1 p-2 text-xs text-left rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                    Usar TAG manual: {equipSearch}
                  </button>
                )}
                {showEquipSearch && equipResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {equipResults.map((node, i) => (
                      <button key={node.node_id || i} onClick={() => selectEquip(node)} className="w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="text-sm font-bold text-gray-900">{node.tag || node.code}</div>
                        <div className="text-xs text-gray-500">{node.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500">
                <div>
                  <div className="text-sm font-bold text-emerald-700">{form.whereTag}</div>
                  <div className="text-xs text-emerald-600">{selectedEquip.name}</div>
                </div>
                <button onClick={() => { setSelectedEquip(null); setF('whereTag', ''); clearLocation(); }}>
                  <X className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            )}
          </div>

          {/* 4. Ubicacion Tecnica (SAP) */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Ubicacion Tecnica
            </label>
            {!selectedLoc ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={locSearch}
                  onChange={e => { setLocSearch(e.target.value); setShowLocSearch(true); }}
                  onFocus={() => locSearch.length >= 2 && setShowLocSearch(true)}
                  placeholder="Buscar ubicacion tecnica..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                {showLocSearch && locResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {locResults.map((node, i) => (
                      <button key={node.node_id || i} onClick={() => selectLocation(node)} className="w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{node.node_type}</span>
                          <span className="text-sm font-bold text-gray-900">{node._funcLoc}</span>
                        </div>
                        <div className="text-xs text-gray-500">{node.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border-2 border-blue-500">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                    <span className="text-sm font-bold font-mono truncate text-blue-800">{form.technicalLocationCode}</span>
                  </div>
                  <div className="text-xs text-blue-600">{form.technicalLocation}</div>
                </div>
                <button onClick={clearLocation} className="flex-shrink-0 ml-2">
                  <X className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            )}
            {selectedEquip && selectedLoc && (
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle className="w-3 h-3" /> Ubicacion auto-detectada desde {form.whereTag}
              </div>
            )}
          </div>

          </div>
          <div style={{display: wizardStep === 2 ? undefined : "none"}}>
          {/* 5. Catalogo de Falla */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catalogo de Falla</label>
            </div>
            <div className="flex gap-1 mb-3 p-1 rounded-lg bg-gray-100">
              {Object.entries(FAILURE_CATALOG).map(([key, cat]) => (
                <button key={key} onClick={() => { setF('failureCategory', key); setF('failureSymptom', ''); setF('failureObjectPart', ''); setF('failureCause', ''); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${form.failureCategory === key ? 'bg-white shadow-sm' : ''}`}
                  style={{ color: form.failureCategory === key ? cat.color : '#94a3b8' }}>{cat.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Parte Objeto */}
              <div className="relative">
                <div className="text-xs font-medium text-gray-600 mb-1">Parte Objeto</div>
                <button onClick={() => { setShowParts(!showParts); setShowSymptoms(false); setShowCauses(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                  style={{ borderColor: form.failureObjectPart ? FAILURE_CATALOG[form.failureCategory].color : '#e5e7eb' }}>
                  <span className={form.failureObjectPart ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureObjectPart || 'Seleccionar...'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showParts && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {FAILURE_CATALOG[form.failureCategory].parts.map(p => (
                      <button key={p} onClick={() => { setF('failureObjectPart', p); setShowParts(false); }}
                        className={`w-full text-left px-2 py-1.5 text-xs border-b last:border-b-0 hover:bg-gray-50 ${form.failureObjectPart === p ? 'font-bold bg-gray-50' : ''}`}>{p}</button>
                    ))}
                  </div>
                )}
              </div>
              {/* Sintoma */}
              <div className="relative">
                <div className="text-xs font-medium text-gray-600 mb-1">Sintoma</div>
                <button onClick={() => { setShowSymptoms(!showSymptoms); setShowParts(false); setShowCauses(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                  style={{ borderColor: form.failureSymptom ? FAILURE_CATALOG[form.failureCategory].color : '#e5e7eb' }}>
                  <span className={form.failureSymptom ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureSymptom || 'Seleccionar...'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showSymptoms && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {FAILURE_CATALOG[form.failureCategory].symptoms.map(s => (
                      <button key={s} onClick={() => { setF('failureSymptom', s); setShowSymptoms(false); }}
                        className={`w-full text-left px-2 py-1.5 text-xs border-b last:border-b-0 hover:bg-gray-50 ${form.failureSymptom === s ? 'font-bold bg-gray-50' : ''}`}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
              {/* Causa */}
              <div className="relative">
                <div className="text-xs font-medium text-gray-600 mb-1">Causa</div>
                <button onClick={() => { setShowCauses(!showCauses); setShowSymptoms(false); setShowParts(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                  style={{ borderColor: form.failureCause ? FAILURE_CATALOG[form.failureCategory].color : '#e5e7eb' }}>
                  <span className={form.failureCause ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureCause || 'Seleccionar...'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showCauses && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {FAILURE_CATALOG[form.failureCategory].causes.map(c => (
                      <button key={c} onClick={() => { setF('failureCause', c); setShowCauses(false); }}
                        className={`w-full text-left px-2 py-1.5 text-xs border-b last:border-b-0 hover:bg-gray-50 ${form.failureCause === c ? 'font-bold bg-gray-50' : ''}`}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          </div>
          <div style={{display: wizardStep === 3 ? undefined : "none"}}>
          {/* 6. Accion Sugerida */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Accion Sugerida</label>
            <textarea value={form.suggestedAction} onChange={e => setF('suggestedAction', e.target.value)}
              placeholder="Que accion correctiva recomienda?"
              rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
          </div>

          {/* 7. Circunstancias / Detalle */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Circunstancias / Detalle</label>
            <textarea value={form.circumstances} onChange={e => setF('circumstances', e.target.value)}
              placeholder="Condiciones al momento de la falla, contexto operacional..."
              rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
            <div className="text-[10px] text-gray-400 mt-1">SAP PM: Texto largo del aviso</div>
          </div>

          {/* 8. Recursos Necesarios */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recursos Necesarios</label>
              <button onClick={addResource} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                + Agregar
              </button>
            </div>
            {form.resources.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Tipo recurso</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Cantidad</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Horas</div>
              </div>
            ) : (
              <div className="space-y-2">
                {form.resources.map((res, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="relative">
                      <input type="text" placeholder="Tipo" value={res.type}
                        onChange={e => { updateResource(i, 'type', e.target.value); setActiveResTypeIdx(i); }}
                        onFocus={() => setActiveResTypeIdx(i)}
                        onBlur={() => setTimeout(() => setActiveResTypeIdx(-1), 150)}
                        className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      {activeResTypeIdx === i && (
                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {RESOURCE_TYPES.filter(rt => !res.type || rt.toLowerCase().includes(res.type.toLowerCase())).map(rt => (
                            <button key={rt} onClick={() => { updateResource(i, 'type', rt); setActiveResTypeIdx(-1); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 border-b last:border-b-0">{rt}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="Cant" value={res.quantity} onChange={e => updateResource(i, 'quantity', e.target.value)}
                        className="w-full p-2 pr-16 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">personas</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="relative flex-1">
                        <input type="text" placeholder="Hrs" value={res.hours} onChange={e => updateResource(i, 'hours', e.target.value)}
                          className="w-full p-2 pr-10 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">hrs</span>
                      </div>
                      <button onClick={() => removeResource(i)} className="px-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 9. Duracion Estimada */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Duracion Estimada
            </label>
            <input type="text" value={form.estimatedDuration} onChange={e => setF('estimatedDuration', e.target.value)}
              placeholder="Ej: 4 (horas)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>

          {/* 10. Materiales SAP */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Materiales SAP</label>
              </div>
              <button onClick={addMaterial} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                + Agregar
              </button>
            </div>
            {form.materials.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">SAP ID</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Cantidad</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Descripcion</div>
              </div>
            ) : (
              <div className="space-y-2">
                {form.materials.map((mat, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="relative">
                      <input type="text" placeholder="SAP ID" value={mat.sapId}
                        onChange={e => { updateMaterial(i, 'sapId', e.target.value); setActiveMatSapIdx(i); }}
                        onFocus={() => setActiveMatSapIdx(i)}
                        onBlur={() => setTimeout(() => setActiveMatSapIdx(-1), 150)}
                        className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      {activeMatSapIdx === i && (
                        <div className="absolute z-20 left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto" style={{ minWidth: '280px' }}>
                          {COMMON_MATERIALS.filter(m => !mat.sapId || m.sapId.includes(mat.sapId) || m.desc.toLowerCase().includes(mat.sapId.toLowerCase())).map(m => (
                            <button key={m.sapId} onClick={() => { updateMaterial(i, 'sapId', m.sapId); updateMaterial(i, 'description', m.desc); setActiveMatSapIdx(-1); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 border-b last:border-b-0">
                              <span className="font-mono text-emerald-700">{m.sapId}</span> - {m.desc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="Cant" value={mat.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                        className="w-full p-2 pr-10 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">uds</span>
                    </div>
                    <div className="flex gap-1">
                      <input type="text" placeholder="Descripcion" value={mat.description} onChange={e => updateMaterial(i, 'description', e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <button onClick={() => removeMaterial(i)} className="px-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 11. Equipos Especiales */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Equipos Especiales</label>
            <div className="relative">
              <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input type="text" value={form.specialEquipment}
                onChange={e => { setF('specialEquipment', e.target.value); setShowSpecEquip(true); }}
                onFocus={() => setShowSpecEquip(true)}
                onBlur={() => setTimeout(() => setShowSpecEquip(false), 150)}
                placeholder="Grua, andamio, soldadora..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              {showSpecEquip && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {SPECIAL_EQUIPMENT.filter(se => !form.specialEquipment || se.toLowerCase().includes(form.specialEquipment.toLowerCase())).map(se => (
                    <button key={se} onClick={() => {
                      const cur = form.specialEquipment;
                      setF('specialEquipment', cur ? `${cur}, ${se}` : se);
                      setShowSpecEquip(false);
                    }} className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b last:border-b-0">{se}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 12. Autor del Aviso */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Autor del Aviso
            </label>
            <input type="text" value={form.reportedBy} onChange={e => setF('reportedBy', e.target.value)}
              placeholder="Nombre del supervisor o reportante"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <div className="text-[10px] text-gray-400 mt-1">SAP PM: Autor del aviso (campo QMNUM)</div>
          </div>

          {/* 13. Equipos de Apoyo */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Equipos de Apoyo</label>
            <input type="text" value={form.supportEquipment} onChange={e => setF('supportEquipment', e.target.value)}
              placeholder="Equipos adicionales necesarios (separados por coma)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <div className="text-[10px] text-gray-400 mt-1">Equipos de apoyo o soporte adicional requerido</div>
          </div>

          {/* 14. Adjuntos */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Adjuntos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer"
              onDragOver={e => e.preventDefault()} onDrop={handleDrop}
              onClick={() => document.getElementById('fc-file-input').click()}>
              <input id="fc-file-input" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
              <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-500">Arrastra archivos o haz clic para subir</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF (max 10MB)</p>
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

          {/* 15. Clase de Actividad */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Clase de Actividad ({claseOT})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {actClasses.map(ac => (
                <button key={ac.value} onClick={() => setF('activityClass', ac.value)}
                  className={`p-2.5 rounded-lg border-2 text-xs font-semibold text-center transition-all ${form.activityClass === ac.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {ac.value} - {ac.label}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* Wizard Navigation */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
          <button type="button"
            onClick={() => setWizardStep(s => Math.max(1, s - 1))}
            disabled={wizardStep === 1}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
            &larr; Anterior
          </button>
          <div className="flex items-center gap-1.5">
            {[1,2,3].map(s => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${wizardStep === s ? "bg-emerald-600 scale-125" : wizardStep > s ? "bg-emerald-300" : "bg-gray-300"}`} />
            ))}
          </div>
          {wizardStep < 3 ? (
            <button type="button"
              onClick={() => setWizardStep(s => Math.min(3, s + 1))}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Siguiente &rarr;
            </button>
          ) : (
            <span />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-5 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {selectedPriority && (
              <span className="font-mono px-2 py-1 rounded" style={{ backgroundColor: selectedPriority.bg, color: selectedPriority.color }}>
                {selectedPriority.value} / {claseOT}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleReset} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={submitting || !canSubmit || wizardStep !== 3}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
                : <>Crear Aviso de Trabajo <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
