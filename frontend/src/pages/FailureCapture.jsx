import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { suggestFailureFields, aiAssistImage } from '../api';
import { useOutletContext } from 'react-router-dom';
import { Upload, Loader2, ArrowRight, X, Mic, MicOff, Camera, AlertTriangle, Search, ChevronDown, Clock, Package, Wrench, Users, MapPin, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '../components/Toast';
import EquipmentChat from '../components/EquipmentChat';
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
    { value: 'stopped', label: 'Detenido', color: '#EF4444' },
  ];

  const PRIORITIES = [
    { value: 'P1', label: 'P1 (I) - Immediate', sub: '< 24h', color: '#EF4444', bg: '#FEE2E2', claseOT: 'PM03' },
    { value: 'P2', label: 'P2 (A) - Alta', sub: '< 7 dias', color: '#F97316', bg: '#FED7AA', claseOT: 'PM03' },
    { value: 'P3', label: 'P3 (M) - Media', sub: '> 7 dias', color: '#EAB308', bg: '#FEF3C7', claseOT: 'PM01' },
    { value: 'P4', label: 'P4 (B) - Baja', sub: 'Parada Planta', color: '#3B82F6', bg: '#DBEAFE', claseOT: 'PM01' },
  ];

  const ACTIVITY_CLASSES = {
    PM01: [
      { value: 'M001', label: 'Solicitud de mantenimiento' },
      { value: 'M002', label: 'Avería' },
      { value: 'M003', label: 'Reparación de componentes' },
    ],
    PM03: [
      { value: 'M001', label: 'Solicitud de mantenimiento' },
      { value: 'M002', label: 'Avería' },
      { value: 'M003', label: 'Reparación de componentes' },
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

  
  const [showExtModal, setShowExtModal] = useState(false);
  const [extForm, setExtForm] = useState({ service: '', vendor: '', contract_ref: '', specialty: '', estimated_cost: '', duration_days: '', notes: '' });

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

  // ── BBP SAP PM Master Data (AMSA_BBP_PM_04) ──
  const AVISO_CLASSES = [
    { value: 'A1', label: 'A1 - Aviso de Mantenimiento', desc: 'Correctivo / Solicitud' },
    { value: 'A2', label: 'A2 - Aviso Predictivo e Ing.', desc: 'Predictivo / Ingenieria' },
    { value: 'A3', label: 'A3 - Aviso Plan Preventivo', desc: 'Plan de Mantenimiento' },
  ];

  const AVISO_CODING = {
    A1: [
      { value: 'M001', label: 'M001 - Solicitud de mantenimiento' },
      { value: 'M002', label: 'M002 - Averia' },
      { value: 'M003', label: 'M003 - Reparacion de componentes' },
    ],
    A2: [
      { value: 'P001', label: 'P001 - Predictivo' },
      { value: 'P002', label: 'P002 - Ingenieria' },
    ],
    A3: [],
  };

  const PLANNING_GROUPS = [
    { value: 'P01', label: 'P01 - Planta Area Seca', area: 'Planta' },
    { value: 'P02', label: 'P02 - Planta Area Ripio', area: 'Planta' },
    { value: 'P03', label: 'P03 - Planta Area Humeda', area: 'Planta' },
    { value: 'M01', label: 'M01 - Mina Perforacion', area: 'Mina' },
    { value: 'M02', label: 'M02 - Mina Carguio', area: 'Mina' },
    { value: 'M03', label: 'M03 - Mina Transporte', area: 'Mina' },
    { value: 'M04', label: 'M04 - Mina Equipos de Apoyo', area: 'Mina' },
    { value: 'M05', label: 'M05 - Mina Equipos Auxiliares', area: 'Mina' },
  ];

  const AREAS_EMPRESA = [
    { value: 'SEC', label: 'Area Seca' },
    { value: 'HUM', label: 'Area Humeda' },
    { value: 'RIP', label: 'Area Ripio' },
    { value: 'PER', label: 'Perforacion' },
    { value: 'CAR', label: 'Carguio' },
    { value: 'TRA', label: 'Transporte' },
    { value: 'APO', label: 'Apoyo' },
    { value: 'AUX', label: 'Auxiliar' },
    { value: 'TAL', label: 'Taller' },
  ];

  const WORK_CENTERS = [
    { value: 'PASMEC01', label: 'Mecanico Area Seca', area: 'P01' },
    { value: 'PASELE01', label: 'Electrico Area Seca', area: 'P01' },
    { value: 'PASINS01', label: 'Instrumentista Area Seca', area: 'P01' },
    { value: 'PASLUB01', label: 'Lubricacion Area Seca', area: 'P01' },
    { value: 'PARELE01', label: 'Electrico Area Ripio', area: 'P02' },
    { value: 'PARINS01', label: 'Instrumentista Area Ripio', area: 'P02' },
    { value: 'PAHMEC01', label: 'Mecanico Area Humeda', area: 'P03' },
    { value: 'PAHELE01', label: 'Electrico Area Humeda', area: 'P03' },
    { value: 'PAHINS01', label: 'Instrumentista Area Humeda', area: 'P03' },
    { value: 'PSHSIN01', label: 'Sintomatico', area: 'P01' },
    { value: 'PSHDCS01', label: 'DCS y Automatizacion', area: 'P01' },
    { value: 'MPCMEC01', label: 'Mecanico Perforacion y Carguio', area: 'M01' },
    { value: 'MTAMEC01', label: 'Mecanico Transporte y Apoyo', area: 'M03' },
    { value: 'MPCELE01', label: 'Electrico Perforacion y Carguio', area: 'M01' },
    { value: 'MTAELE01', label: 'Electrico Transporte y Apoyo', area: 'M03' },
    { value: 'MPREDI01', label: 'Predictivo', area: 'M01' },
    { value: 'MEXTSOL1', label: 'Soldadura (Ext)', area: 'M04' },
    { value: 'MEXTLAV1', label: 'Lavado (Ext)', area: 'M04' },
    { value: 'MEXTNEU1', label: 'Neumaticos (Ext)', area: 'M04' },
    { value: 'MEXTCAB1', label: 'Cabina (Ext)', area: 'M04' },
    { value: 'MEXTSCI1', label: 'Sistema Contra Incendios (Ext)', area: 'M04' },
    { value: 'MEXTGET1', label: 'Elemento de Desgaste (Ext)', area: 'M04' },
  ];

  const SAP_PRIORITY_MAP = {
    P1: { sap: 'I', label: 'Immediate', days: '< 24h' },
    P2: { sap: 'A', label: 'Alta', days: '< 7 dias' },
    P3: { sap: 'M', label: 'Media', days: '> 7 dias' },
    P4: { sap: 'B', label: 'Baja', days: 'Parada Planta' },
  };

  const ORDER_TYPES = [
    { value: 'PM01', label: 'PM01 - Orden Mant. de Averia' },
    { value: 'PM02', label: 'PM02 - Orden Mant. Preventivo' },
    { value: 'PM03', label: 'PM03 - Orden de Solicitud de Mant.' },
    { value: 'PM06', label: 'PM06 - Orden de Inversion' },
    { value: 'PM07', label: 'PM07 - Orden de Reparacion de Componentes' },
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
    activityClass: 'M001',
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
    supportEquipment: [],
    notificationClass: 'A1',
    avisoCoding: 'M001',
    planningGroup: '',
    areaEmpresa: '',
    workCenter: '',
  });
  const [submitting, setSubmitting] = useState(false);
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

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1=Ubicacion, 2=Falla, 3=Accion
  const [chatOpen, setChatOpen] = useState(false);
  const [detectedEquipment, setDetectedEquipment] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateDetail, setShowDuplicateDetail] = useState(null);
  const dupeCheckTimer = useRef(null);

  const handleAiSuggest = async (overrideText) => {
    // Check duplicates
    const eqTag = form.whereTag || '';
    const desc = overrideText || form.whatHappens || '';
    if (desc.length > 3 || eqTag) {
      api.checkDuplicates({ description: desc, equipment_tag: eqTag })
        .then(res => { if (res?.duplicates?.length > 0) setDuplicates(res.duplicates); })
        .catch(() => {});
    }
    // If photos exist, use Vision AI (even without text)
    if (photos.length > 0) {
      await handleVisionAnalysis();
      return;
    }
    if (!desc?.trim() && photos.length === 0) {
      alert('Escribe la descripcion o toma una foto primero');
      return;
    }
    setAiLoading(true);
    try {
      const res = await suggestFailureFields({
        description: desc,
        equipment_tag: form.whereTag || form.equipmentTag,
        equipment_name: form.whereName || form.equipmentName,
      });
      if (res?.suggestions) {
        const s = res.suggestions;
        if (s.failure_category) {
          const cat = s.failure_category.toUpperCase().trim();
          const validCats = ['MECANICO', 'ELECTRICO', 'INSTRUMENTACION'];
          if (validCats.includes(cat)) setF('failureCategory', cat);
          else if (cat.includes('MEC')) setF('failureCategory', 'MECANICO');
          else if (cat.includes('ELEC')) setF('failureCategory', 'ELECTRICO');
          else if (cat.includes('INST')) setF('failureCategory', 'INSTRUMENTACION');
        }
        if (s.failure_symptom || s.failureSymptom) {
          const sym = (s.failure_symptom || s.failureSymptom).toUpperCase().trim();
          const tCat = FAILURE_CATALOG[form.failureCategory] || FAILURE_CATALOG.MECANICO;
          if (tCat.symptoms.includes(sym)) setF('failureSymptom', sym);
        }
        if (s.failure_cause || s.failureCause) {
          const cau = (s.failure_cause || s.failureCause).toUpperCase().trim();
          const tCat2 = FAILURE_CATALOG[form.failureCategory] || FAILURE_CATALOG.MECANICO;
          if (tCat2.causes.includes(cau)) setF('failureCause', cau);
        }
        if (s.failure_object_part || s.failureObjectPart) {
          const part = (s.failure_object_part || s.failureObjectPart).toUpperCase().trim();
          const tCat3 = FAILURE_CATALOG[form.failureCategory] || FAILURE_CATALOG.MECANICO;
          if (tCat3.parts.includes(part)) setF('failureObjectPart', part);
        }
        // Apply ALL fields from Claude (camelCase + snake_case)
        if (s.enhanced_description) setF('whatHappens', s.enhanced_description);
        if (s.suggestedAction || s.suggested_action) setF('suggestedAction', s.suggestedAction || s.suggested_action);
        if (s.activityClass || s.activity_class) setF('activityClass', s.activityClass || s.activity_class);
        if (s.priority) setF('priority', s.priority);
        if (s.estimatedDuration || s.estimated_duration) setF('estimatedDuration', String(s.estimatedDuration || s.estimated_duration));
        if (s.plantCondition || s.plant_condition) {
          const pc = (s.plantCondition || s.plant_condition).toLowerCase();
          setF('plantCondition', pc === 'running' ? 'operating' : pc === 'stopped' ? 'stopped' : pc);
        }
        if (s.resources?.length) setF('resources', s.resources);
        if (s.materials?.length) setF('materials', s.materials);
        if (s.supportEquipment?.length) setF('supportEquipment', s.supportEquipment);
        if (s.support_equipment?.length) setF('supportEquipment', s.support_equipment);
        if (s.workConditions || s.work_conditions) setF('workConditions', s.workConditions || s.work_conditions);
        setAiSuggested(true);
      }
    } catch (e) {
      console.error('AI suggest failed:', e);
      alert('Error al conectar con IA. Verifica configuración del servidor.');
    } finally {
      setAiLoading(false);
    }
  };

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
    if (equipSearch.length === 0) { setEquipResults(allEquipment.slice(0, 10)); return; }
    if (equipSearch.length < 1) { setEquipResults([]); return; }
    const q = equipSearch.toLowerCase();
    setEquipResults(allEquipment.filter(n =>
      (n.tag || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [equipSearch, allEquipment]);

  // Filter location results
  useEffect(() => {
    if (!locSearch) { setLocResults(locationNodes.slice(0, 8)); return; }
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

  // ── Equipment selection ──
  const selectEquip = (node) => {
    setSelectedEquip(node);
    setF('whereTag', node.tag || node.code || '');
    setEquipSearch('');
    setShowEquipSearch(false);
    // Check for duplicates on this equipment
    const eqTag = node.tag || node.code || '';
    if (eqTag) {
      api.checkDuplicates({ description: form.whatHappens || '', equipment_tag: eqTag })
        .then(res => { if (res?.duplicates?.length > 0) setDuplicates(res.duplicates); })
        .catch(() => {});
    }
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
    const funcLoc = node._funcLoc || node.code || '';
    setF('technicalLocationCode', funcLoc);
    setShowLocSearch(false);
    setLocSearch('');
    const upper = funcLoc.toUpperCase();
    let matchedGroup = null;
    if (upper.includes('SECA') || upper.includes('-SEC')) matchedGroup = 'P01';
    else if (upper.includes('RIPIO') || upper.includes('-RIP')) matchedGroup = 'P02';
    else if (upper.includes('HUMEDA') || upper.includes('-HUM')) matchedGroup = 'P03';
    else if (upper.includes('PERFOR') || upper.includes('-PER')) matchedGroup = 'M01';
    else if (upper.includes('CARGU') || upper.includes('-CAR')) matchedGroup = 'M02';
    else if (upper.includes('TRANSP') || upper.includes('-TRA')) matchedGroup = 'M03';
    else if (upper.includes('APOYO') || upper.includes('-APO')) matchedGroup = 'M04';
    else if (upper.includes('AUXIL') || upper.includes('-AUX')) matchedGroup = 'M05';
    if (matchedGroup) {
      setF('planningGroup', matchedGroup);
      const matchedWC = WORK_CENTERS.filter(wc => wc.area === matchedGroup);
      if (matchedWC.length > 0) setF('workCenter', matchedWC[0].value);
    }
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
    recognition.onerror = (e) => {
      setIsRecording(false);
      const msg = {
        'not-allowed': 'Permiso de micrófono denegado. Permite el acceso en tu navegador.',
        'no-speech': 'No se detectó voz. Intenta de nuevo.',
        'network': 'Error de red. Verifica la conexión.',
        'audio-capture': 'No se encontró micrófono.',
      }[e.error] || `Error de voz: ${e.error}`;
      toast.error(msg);
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        const base = baseTextRef.current;
        const sep = base ? '\n' : '';
        const fullText = (base + sep + finalTranscript).trimEnd();
        setF('whatHappens', fullText);
        // Auto-trigger AI assist with the transcribed text
        toast.success('Voz transcrita. Analizando con IA...');
        setTimeout(() => {
          handleAiSuggest(fullText);
        }, 300);
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

  const handleVisionAnalysis = async () => {
    if (photos.length === 0) { toast.error('Sube al menos una foto'); return; }
    setVisionLoading(true);
    try {
      const res = await aiAssistImage({
        images: photos,
        equipment_tag: form.whereTag || form.equipmentTag || '',
        additional_context: form.whatHappens || '',
      });
      if (res?.suggestions) {
        const s = res.suggestions;
        if (s.whatHappens) setF('whatHappens', s.whatHappens);
        if (s.failureCategory) {
          const cat = s.failureCategory.toUpperCase().trim();
          if (['MECANICO', 'ELECTRICO', 'INSTRUMENTACION'].includes(cat)) setF('failureCategory', cat);
        }
        if (s.priority) setF('priority', s.priority);
        if (s.activityClass) setF('activityClass', s.activityClass);
        if (s.suggestedAction) setF('suggestedAction', s.suggestedAction);
        // Validate catalog values against FAILURE_CATALOG
        const aiCat = (s.failureCategory || form.failureCategory || 'MECANICO').toUpperCase();
        const catData = FAILURE_CATALOG[aiCat] || FAILURE_CATALOG.MECANICO;
        if (s.failureSymptom) {
          const sym = s.failureSymptom.toUpperCase().trim();
          if (catData.symptoms.includes(sym)) setF('failureSymptom', sym);
        }
        if (s.failureCause) {
          const cau = s.failureCause.toUpperCase().trim();
          if (catData.causes.includes(cau)) setF('failureCause', cau);
        }
        if (s.failureObjectPart) {
          const part = s.failureObjectPart.toUpperCase().trim();
          if (catData.parts.includes(part)) setF('failureObjectPart', part);
        }
        if (s.estimatedDuration) setF('estimatedDuration', String(s.estimatedDuration));
        if (s.plantCondition) {
          const vpc = s.plantCondition.toLowerCase();
          setF('plantCondition', vpc === 'running' ? 'operating' : vpc === 'stopped' ? 'stopped' : vpc);
        }
        if (s.resources?.length) setF('resources', s.resources);
        if (s.materials?.length) setF('materials', s.materials);
        if (s.supportEquipment?.length) setF("supportEquipment", s.supportEquipment);
        if (s.workConditions) setF("workConditions", s.workConditions);
        setAiSuggested(true);
        toast.success('Fotos analizadas por IA - campos pre-llenados');
      }
    } catch (e) {
      console.error('Vision AI error:', e);
      toast.error('Error al analizar fotos con IA');
    } finally {
      setVisionLoading(false);
    }
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
  const addMaterial = () => setF('materials', [...form.materials, { sapId: '', quantity: '1', unit: 'UD', description: '' }]);
  const updateMaterial = (i, fieldOrObj, value) => {
    const updated = [...form.materials];
    if (typeof fieldOrObj === 'object') {
      updated[i] = { ...updated[i], ...fieldOrObj };
    } else {
      updated[i] = { ...updated[i], [fieldOrObj]: value };
    }
    setF('materials', updated);
  };
  const removeMaterial = (i) => setF('materials', form.materials.filter((_, idx) => idx !== i));

  // ── Derived values ──
  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);
  const claseOT = selectedPriority?.claseOT || 'PM01';
  const actClasses = ACTIVITY_CLASSES[claseOT] || [];
  const canSubmit = form.whatHappens.trim() && form.technicalLocationCode.trim();

  // ── Submit ──
  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    const effectiveTag = form.whereTag.trim() || equipSearch.trim();
    setSubmitting(true);
    try {
      const res = await api.createWRManual({
        equipment_tag: effectiveTag,
        equipment_name: selectedEquip?.name || effectiveTag,
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
        materials: (form.materials || []).filter(m => typeof m === 'object' ? (m.sapId || m.description) : m),
        resources: (form.resources || []).map(r => typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1} (${r.hours || 0}h)`).filter(Boolean),
        documents: [
          ...photos.map((data, i) => ({ name: `foto_${i + 1}.jpg`, data, type: 'photo' })),
          ...attachments.map(att => ({ name: att.name, data: att.data, type: 'file' })),
        ],
        circumstances: form.circumstances || '',
        reported_by: form.reportedBy || '',
        support_equipment: form.supportEquipment || [],
        technical_location: form.technicalLocationCode || '',
        notification_type: form.notificationClass || 'A1',
        aviso_coding: form.avisoCoding || '',
        planning_group: form.planningGroup || '',
        area_empresa: form.areaEmpresa || '',
        work_center: form.workCenter || '',
        work_conditions: form.workConditions || '',
        created_by: user?.full_name || user?.username || '',
      });
      const wrId = res?.request_id || res?.work_request_id || '';
      setCreatedWRId(wrId);
      toast.success('Aviso creado: ' + wrId.slice(0, 8));
    } catch (err) {
      toast.error(err.message || 'Error al crear aviso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      whatHappens: '', whereTag: '', technicalLocation: '', technicalLocationCode: '',
      suggestedAction: '', estimatedDuration: '', priority: 'P3', activityClass: 'M001',
      plantCondition: 'operating', failureCategory: 'MECANICO', failureSymptom: '',
      failureObjectPart: '', failureCause: '', resources: [], materials: [],
      specialEquipment: '', circumstances: '', reportedBy: form.reportedBy, supportEquipment: [],
      notificationClass: 'A1', avisoCoding: 'M001', planningGroup: '', areaEmpresa: '', workCenter: '', workConditions: '',
    });
    setSelectedEquip(null);
    setSelectedLoc(null);
    setPhotos([]);
    setAttachments([]);
    setCreatedWRId(null);
  };

  // ── Success popup ──
  // Duplicate panel component
  const DuplicatePanel = () => {
    if (duplicates.length === 0) return null;
    return (
      <div className="fixed right-4 top-[220px] w-72 bg-white rounded-xl shadow-2xl border-2 border-amber-300 z-40 max-h-[70vh] overflow-y-auto animate-in slide-in-from-right">
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-800">Posibles Duplicados</span>
            </div>
            <button onClick={() => setDuplicates([])} className="text-amber-400 hover:text-amber-600 text-lg">&times;</button>
          </div>
          <p className="text-xs text-amber-600 mt-1">{duplicates.length} aviso(s) similar(es) encontrado(s)</p>
        </div>
        <div className="divide-y divide-gray-100">
          {duplicates.map((d, i) => (
            <button key={i} onClick={() => setShowDuplicateDetail(d)}
              className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gray-500">{(d.request_id || d.id || '').slice(0, 12)}...</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.status === 'PENDING_VALIDATION' ? 'bg-yellow-100 text-yellow-700' : d.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.status || '?'}</span>
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">{d.description || d.failure_description || ''}</p>
              <div className="flex items-center gap-2 mt-1">
                {d.equipment_tag && <span className="text-xs text-blue-600 font-mono">{d.equipment_tag}</span>}
                {d.priority && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${['P1','P2'].includes(d.priority) ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{d.priority}</span>}
                {d.created_at && <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString('es-CL')}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Duplicate detail modal — full info + navigation button
  const DuplicateDetailModal = () => {
    if (!showDuplicateDetail) return null;
    const d = showDuplicateDetail;
    const pd = typeof d.problem_description === 'object' ? d.problem_description : {};
    const desc = pd.original_text || d.description || d.failure_description || '-';
    const action = pd.suggested_action || d.suggested_action || '';
    const resources = pd.resources || [];
    const materials = pd.materials || [];
    const failureMode = pd.failure_mode_detected || '';
    const failureSymptom = pd.failure_symptom || '';
    const failureCause = pd.failure_cause || '';
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDuplicateDetail(null)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-200 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Aviso Existente</h3>
              <span className="text-xs font-mono text-amber-600">{d.request_id || d.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowDuplicateDetail(null); setDuplicates([]); if (onNavigateTab) onNavigateTab('identification', d.request_id || d.id); }}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Ir al Aviso
              </button>
              <button onClick={() => setShowDuplicateDetail(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Status cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Estado</span>
                <span className={`text-sm font-bold ${d.status === 'VALIDATED' ? 'text-green-700' : d.status === 'PENDING_VALIDATION' ? 'text-yellow-700' : 'text-gray-700'}`}>{d.status}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Prioridad</span>
                <span className={`text-sm font-bold ${['P1','P2'].includes(d.priority) ? 'text-red-600' : 'text-orange-600'}`}>{d.priority || '-'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Equipo</span>
                <span className="text-sm font-bold font-mono">{d.equipment_tag || '-'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Similitud</span>
                <span className="text-sm font-bold text-amber-600">{Math.round((d.similarity || 0) * 100)}%</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Descripcion de Falla</span>
              <p className="text-sm bg-gray-50 rounded-lg p-3 border border-gray-200 leading-relaxed">{desc}</p>
            </div>

            {/* Action */}
            {action && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Suggested Action</span>
                <p className="text-sm bg-emerald-50 rounded-lg p-3 border border-emerald-200 leading-relaxed">{action}</p>
              </div>
            )}

            {/* Failure catalog */}
            {(failureMode || failureSymptom || failureCause) && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Catalogo de Falla</span>
                <div className="grid grid-cols-3 gap-2">
                  {failureMode && <div className="bg-blue-50 rounded-lg p-2 text-center"><span className="text-[10px] text-blue-500 block">Categoria</span><span className="text-xs font-bold text-blue-700">{failureMode}</span></div>}
                  {failureSymptom && <div className="bg-yellow-50 rounded-lg p-2 text-center"><span className="text-[10px] text-yellow-600 block">Sintoma</span><span className="text-xs font-bold text-yellow-700">{failureSymptom}</span></div>}
                  {failureCause && <div className="bg-red-50 rounded-lg p-2 text-center"><span className="text-[10px] text-red-500 block">Causa</span><span className="text-xs font-bold text-red-700">{failureCause}</span></div>}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Recursos</span>
                <div className="space-y-1">
                  {resources.map((r, i) => (
                    <div key={i} className="text-xs bg-gray-50 rounded px-3 py-1.5 border border-gray-200">
                      {typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1} (${r.hours || 0}h)`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {materials.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Materiales</span>
                <div className="space-y-1">
                  {materials.map((m, i) => (
                    <div key={i} className="text-xs bg-gray-50 rounded px-3 py-1.5 border border-gray-200 flex items-center gap-2">
                      {typeof m === 'object' ? <>
                        {m.sapId && <span className="font-mono text-gray-400">{m.sapId}</span>}
                        <span className="font-medium">{m.description || m.name || ''}</span>
                        {m.quantity && <span className="text-gray-400">x{m.quantity} {m.unit || ''}</span>}
                      </> : <span>{m}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Creado: {d.created_at ? new Date(d.created_at).toLocaleString('es-CL') : '-'}
              </span>
              <button onClick={() => { setShowDuplicateDetail(null); setDuplicates([]); if (onNavigateTab) onNavigateTab('identification', d.request_id || d.id); }}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Ir al Aviso Existente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="text-lg font-bold text-emerald-700 font-mono">{createdWRId.slice(0, 8)}</div>
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
          <DuplicatePanel />
          {form.whereTag && (
            <EquipmentChat
              equipmentTag={form.whereTag}
              equipmentName={selectedEquip?.name || form.whereTag}
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
            />
          )}
          {form.whereTag && !chatOpen && (
            <button onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 flex items-center justify-center z-30 transition-transform hover:scale-110"
              title="Chat IA sobre este equipo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            </button>
          )}
          <DuplicateDetailModal />
          {/* Wizard Stepper */}
          <div className="flex items-center justify-between mb-6 px-2">
            {[
              { step: 1, label: 'Ubicacion', icon: '📍', desc: 'Donde ocurrio' },
              { step: 2, label: 'Falla', icon: '⚠️', desc: 'Que paso' },
              { step: 3, label: 'Accion', icon: '🔧', desc: 'Que hacer' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center flex-1">
                <button onClick={() => setWizardStep(s.step)}
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
                    {isRecording ? 'Grabando... (suelta para analizar)' : 'Voz'}
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
              onChange={e => {
                const text = e.target.value;
                setF('whatHappens', text);
                // Auto-detect equipment from text (debounced)
                clearTimeout(dupeCheckTimer.current);
                if (text.length > 5 && !form.whereTag && allEquipment.length > 0) {
                  dupeCheckTimer.current = setTimeout(() => {
                    const words = text.toLowerCase().split(/\s+/);
                    // Try exact tag match first, then partial
                    const textLower = text.toLowerCase();
                    const match = allEquipment.find(eq => {
                      const tag = (eq.tag || '').toLowerCase();
                      const code = (eq.code || '').toLowerCase();
                      // Exact tag/code appears in the text
                      return tag.length > 2 && textLower.includes(tag) ||
                             code.length > 2 && textLower.includes(code);
                    });
                    if (match && match.tag !== detectedEquipment?.tag) {
                      setDetectedEquipment(match);
                    }
                  }, 800);
                }
              }}
              placeholder="Describa el problema, averia o solicitud de trabajo..."
              rows={5}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-y ${isRecording ? 'border-red-400 bg-red-50/30' : 'border-gray-300'}`}
            />
            {/* AI Suggest Button */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleAiSuggest()}
                disabled={aiLoading || visionLoading || (!form.whatHappens?.trim() && photos.length === 0)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Analizando...
                  </>
                ) : (
                  <>{photos.length > 0 ? '📸 Analizar Foto con IA' : '✨ Asistir con IA'}</>
                )}
              </button>
              {detectedEquipment && !form.whereTag && (
                <button onClick={() => { selectEquip(detectedEquipment); setDetectedEquipment(null); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-all animate-pulse">
                  <MapPin className="w-3.5 h-3.5" />
                  Equipo detectado: <strong>{detectedEquipment.tag || detectedEquipment.code}</strong> ({detectedEquipment.name}) — Click para seleccionar
                </button>
              )}
              {aiSuggested && (
                <span className="text-xs text-violet-600 font-medium">
                  ✓ Campos pre-llenados automáticamente
                </span>
              )}
            </div>
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
            {visionLoading && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl animate-pulse">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
                <span className="text-xs font-semibold text-violet-700">Analizando foto con IA...</span>
              </div>
            )}
          </div>

          {/* 2. Suggested Action */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Suggested Action</label>
            <textarea value={form.suggestedAction} onChange={e => setF('suggestedAction', e.target.value)}
              placeholder="Que accion correctiva recomienda?"
              rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
          </div>

          {/* 3. Condicion del Equipo + Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Condicion del Equipo</label>
              <div className="grid grid-cols-2 gap-2">
                {PLANT_CONDITIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setF('plantCondition', opt.value)}
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
                    onClick={() => { setF('priority', p.value); setF('activityClass', ['P1','P2'].includes(p.value) ? 'M002' : 'M001'); }}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 text-center transition-all ${form.priority === p.value ? 'scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                    style={{ borderColor: form.priority === p.value ? p.color : '#e5e7eb', backgroundColor: form.priority === p.value ? p.bg : 'transparent' }}>
                    <div className="text-sm font-bold" style={{ color: p.color }}>{p.value}</div>
                    <div className="text-[9px] text-gray-500 leading-tight">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>


          </div>
          <div style={{display: wizardStep === 1 ? undefined : "none"}}>
          {/* 3b. Technical Location (SAP) */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Technical Location *
            </label>
            {!selectedLoc ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={locSearch}
                  onChange={e => { setLocSearch(e.target.value); setShowLocSearch(true); }}
                  onFocus={() => setShowLocSearch(true)}
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

          {/* 3c. Grupo de Planificacion + Work Center */}
          {(form.planningGroup || form.workCenter) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-xl p-3 bg-blue-50 border-blue-200">
                <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Grupo de Planificacion</div>
                <select value={form.planningGroup} onChange={e => setF('planningGroup', e.target.value)}
                  className="w-full text-sm font-semibold text-blue-800 bg-transparent border-none focus:outline-none cursor-pointer">
                  <option value="">- Seleccionar -</option>
                  {PLANNING_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="border rounded-xl p-3 bg-blue-50 border-blue-200">
                <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Work Center</div>
                <select value={form.workCenter} onChange={e => setF('workCenter', e.target.value)}
                  className="w-full text-sm font-semibold text-blue-800 bg-transparent border-none focus:outline-none cursor-pointer">
                  <option value="">- Seleccionar -</option>
                  {WORK_CENTERS.filter(wc => !form.planningGroup || wc.area === form.planningGroup).map(wc => <option key={wc.value} value={wc.value}>{wc.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 3d. Equipo / TAG */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Equipo / TAG</label>
            {!selectedEquip ? (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={equipSearch}
                    onChange={e => { setEquipSearch(e.target.value); setShowEquipSearch(true); }}
                    onFocus={() => { setShowEquipSearch(true); if (equipSearch.length < 2) setEquipResults(allEquipment.slice(0, 10)); }}
                    placeholder="Buscar por TAG, codigo o nombre de equipo..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
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
                  style={{ borderColor: form.failureObjectPart ? FAILURE_CATALOG[form.failureCategory]?.color || '#e5e7eb' : '#e5e7eb' }}>
                  <span className={form.failureObjectPart ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureObjectPart || 'Seleccionar...'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showParts && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {FAILURE_CATALOG[form.failureCategory]?.parts?.map(p => (
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
                  style={{ borderColor: form.failureSymptom ? FAILURE_CATALOG[form.failureCategory]?.color || '#e5e7eb' : '#e5e7eb' }}>
                  <span className={form.failureSymptom ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureSymptom || 'Seleccionar...'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showSymptoms && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {FAILURE_CATALOG[form.failureCategory]?.symptoms?.map(s => (
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
                  style={{ borderColor: form.failureCause ? FAILURE_CATALOG[form.failureCategory]?.color || '#e5e7eb' : '#e5e7eb' }}>
                  <span className={form.failureCause ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureCause || 'Seleccionar...'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showCauses && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {FAILURE_CATALOG[form.failureCategory]?.causes?.map(c => (
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
              <Clock className="w-3.5 h-3.5" /> Duracion Estimada (horas)
            </label>
            <input type="text" value={form.estimatedDuration} onChange={e => setF('estimatedDuration', e.target.value)}
              placeholder="Ej: 4 (horas)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>

          {/* 10. SAP Materials */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SAP Materials</label>
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
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      <input type="text" placeholder="Buscar material SAP..." value={mat.sapId}
                        onChange={e => { updateMaterial(i, 'sapId', e.target.value); setActiveMatSapIdx(i); }}
                        onFocus={() => setActiveMatSapIdx(i)}
                        onBlur={() => setTimeout(() => setActiveMatSapIdx(-1), 150)}
                        className="w-full pl-6 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      {activeMatSapIdx === i && (
                        <div className="absolute z-20 left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto" style={{ minWidth: '280px' }}>
                          {COMMON_MATERIALS.filter(m => !mat.sapId || m.sapId.includes(mat.sapId) || m.desc.toLowerCase().includes(mat.sapId.toLowerCase())).map(m => (
                            <button key={m.sapId} onClick={() => { updateMaterial(i, { sapId: m.sapId, description: m.desc }); setActiveMatSapIdx(-1); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 border-b last:border-b-0">
                              <span className="font-mono text-emerald-700">{m.sapId}</span> - {m.desc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <input type="number" min="0" placeholder="Cant" value={mat.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                        className="w-14 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <select value={mat.unit || 'UD'} onChange={e => updateMaterial(i, 'unit', e.target.value)}
                        className="flex-1 p-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
                        <option>UD</option><option>M</option><option>CM</option><option>MM</option>
                        <option>KG</option><option>G</option><option>L</option><option>ML</option>
                        <option>H</option><option>PZA</option><option>ROLLO</option><option>CAJA</option>
                      </select>
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
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Equipos de Apoyo</label>
            {(form.supportEquipment || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.supportEquipment || []).map((se, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
                    <Wrench className="w-3 h-3" />{se}
                    <button onClick={() => setF('supportEquipment', form.supportEquipment.filter((_,j) => j!==i))} className="ml-0.5 text-emerald-500 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input type="text" value={form.specialEquipment}
                onChange={e => { setF('specialEquipment', e.target.value); setShowSpecEquip(true); }}
                onFocus={() => setShowSpecEquip(true)}
                onBlur={() => setTimeout(() => setShowSpecEquip(false), 150)}
                placeholder="Agregar equipo de apoyo..."
                onKeyDown={e => {
                  if (e.key === 'Enter' && form.specialEquipment?.trim()) {
                    e.preventDefault();
                    const val = form.specialEquipment.trim();
                    const isInList = SPECIAL_EQUIPMENT.some(se => se.toLowerCase() === val.toLowerCase());
                    if (isInList) {
                      setF('supportEquipment', [...(form.supportEquipment || []), val]);
                      setF('specialEquipment', '');
                      setShowSpecEquip(false);
                    } else {
                      setExtForm(prev => ({ ...prev, service: val }));
                      setShowExtModal(true);
                      setShowSpecEquip(false);
                    }
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              {showSpecEquip && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {SPECIAL_EQUIPMENT.filter(se =>
                    (!form.specialEquipment || se.toLowerCase().includes(form.specialEquipment.toLowerCase())) &&
                    !(form.supportEquipment || []).includes(se)
                  ).map(se => (
                    <button key={se} onMouseDown={() => {
                      setF('supportEquipment', [...(form.supportEquipment || []), se]);
                      setF('specialEquipment', '');
                      setShowSpecEquip(false);
                    }} className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b last:border-b-0">{se}</button>
                  ))}
                  {form.specialEquipment?.trim() && !SPECIAL_EQUIPMENT.some(se => se.toLowerCase() === form.specialEquipment.toLowerCase()) && (
                    <button onMouseDown={() => {
                      setExtForm(prev => ({ ...prev, service: form.specialEquipment.trim() }));
                      setShowExtModal(true);
                      setShowSpecEquip(false);
                    }} className="w-full text-left px-3 py-2.5 text-xs hover:bg-purple-50 border-t-2 border-purple-200 bg-purple-50/50 text-purple-700 font-semibold">
                      <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[10px] mr-1">EXT</span>
                      External Contract: "{form.specialEquipment.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>


      {/* ═══ EXTERNAL SERVICE CONTRACT MODAL (SAP-style) ═══ */}
      {showExtModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowExtModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header - SAP style */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">SAP ME51N</span>
                    External Service Request
                  </h3>
                  <p className="text-purple-200 text-xs mt-0.5">Framework Contract / Direct Procurement</p>
                </div>
                <button onClick={() => setShowExtModal(false)} className="text-white/70 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Service description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Service / Equipment Required</label>
                <input value={extForm.service} onChange={e => setExtForm(p => ({...p, service: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  placeholder="e.g. Crane 100 Ton, Specialized Welding..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vendor */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Vendor / Contractor</label>
                  <select value={extForm.vendor} onChange={e => setExtForm(p => ({...p, vendor: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500">
                    <option value="">-- Select --</option>
                    <option value="GRUAS_NORTE">Gruas del Norte SpA</option>
                    <option value="SOLDADURAS_PRO">Soldaduras Profesionales Ltda</option>
                    <option value="SERVICIOS_IND">Servicios Industriales OCP</option>
                    <option value="MANTTO_EXTERNO">Mantenimiento Externo S.A.</option>
                    <option value="EQUIP_ESPECIAL">Equipos Especiales Ltda</option>
                    <option value="OTHER">Other (specify in notes)</option>
                  </select>
                </div>

                {/* Specialty */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Specialty</label>
                  <select value={extForm.specialty} onChange={e => setExtForm(p => ({...p, specialty: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500">
                    <option value="">-- Select --</option>
                    <option value="MECANICA">Mechanical</option>
                    <option value="ELECTRICA">Electrical</option>
                    <option value="SOLDADURA">Welding</option>
                    <option value="IZAJE">Lifting / Rigging</option>
                    <option value="INSTRUMENTACION">Instrumentation</option>
                    <option value="CIVIL">Civil Works</option>
                    <option value="ALINEACION">Alignment / Balancing</option>
                    <option value="INSPECCION">Inspection / NDT</option>
                    <option value="OTRO">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Contract reference */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Framework Contract</label>
                  <input value={extForm.contract_ref} onChange={e => setExtForm(p => ({...p, contract_ref: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    placeholder="e.g. CM-2026-0045" />
                </div>

                {/* Estimated cost */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Estimated Cost (USD)</label>
                  <input type="number" min="0" step="100" value={extForm.estimated_cost} onChange={e => setExtForm(p => ({...p, estimated_cost: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    placeholder="0" />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Estimated Duration (days)</label>
                <input type="number" min="1" value={extForm.duration_days} onChange={e => setExtForm(p => ({...p, duration_days: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  placeholder="1" />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Additional Notes</label>
                <textarea rows={2} value={extForm.notes} onChange={e => setExtForm(p => ({...p, notes: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 resize-none"
                  placeholder="Scope details, safety requirements, certifications needed..." />
              </div>

              {/* Cost summary */}
              {extForm.estimated_cost && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs text-purple-600">
                    <div className="font-semibold uppercase">Cost Impact</div>
                    <div className="text-[10px] text-purple-400 mt-0.5">{extForm.vendor || 'TBD'} · {extForm.specialty || 'TBD'} · {extForm.duration_days || '?'} days</div>
                  </div>
                  <div className="text-lg font-bold text-purple-800">${Number(extForm.estimated_cost || 0).toLocaleString()}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-3 rounded-b-2xl bg-gray-50 flex items-center justify-between">
              <button onClick={() => setShowExtModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={() => {
                const label = '[EXT] ' + extForm.service + (extForm.vendor ? ' (' + extForm.vendor + ')' : '') + (extForm.estimated_cost ? ' $' + Number(extForm.estimated_cost).toLocaleString() : '');
                setF('supportEquipment', [...(form.supportEquipment || []), label]);

                // Store external details in form for submission
                const extDetails = [...(form.externalServices || []), { ...extForm }];
                setF('externalServices', extDetails);

                setF('specialEquipment', '');
                setExtForm({ service: '', vendor: '', contract_ref: '', specialty: '', estimated_cost: '', duration_days: '', notes: '' });
                setShowExtModal(false);
              }}
                disabled={!extForm.service}
                className="px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Add External Service
              </button>
            </div>
          </div>
        </div>
      )}

          {/* 11b. Condiciones de Trabajo / Entorno */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Condiciones de Trabajo / Entorno</label>
            <textarea value={form.workConditions} onChange={e => setF('workConditions', e.target.value)}
              placeholder="Condiciones necesarias para ejecutar el trabajo (superficie plana, area despejada, equipo desconectado, etc.)"
              rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
            <div className="text-[10px] text-gray-400 mt-1">Pre-requisitos y condiciones del entorno para la intervencion</div>
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

          {/* 15. Clase de Aviso (SAP) */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Clase de Aviso (SAP)
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

          </div>

        {/* Wizard Navigation */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <button
            onClick={() => setWizardStep(s => Math.max(1, s - 1))}
            disabled={wizardStep === 1}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
            &#8592; Previous
          </button>
          <div className="flex items-center gap-1.5">
            {[1,2,3].map(s => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${wizardStep === s ? 'bg-emerald-600 scale-125' : wizardStep > s ? 'bg-emerald-300' : 'bg-gray-300'}`} />
            ))}
          </div>
          {wizardStep < 3 ? (
            <button
              onClick={() => setWizardStep(s => Math.min(3, s + 1))}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Next &#8594;
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
