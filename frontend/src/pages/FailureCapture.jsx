import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { suggestFailureFields, aiAssistImage } from '../api';
import { useOutletContext } from 'react-router-dom';
import { Upload, Loader2, ArrowRight, X, Mic, MicOff, Camera, AlertTriangle, Search, ChevronDown, ChevronRight, Clock, Package, Wrench, Users, MapPin, CheckCircle, FileText, ClipboardCopy, Lock } from 'lucide-react';
import { useToast } from '../components/Toast';
import EquipmentChat from '../components/EquipmentChat';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

// Browser Speech Recognition (no API key needed)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function FailureCapture({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  // ── SAP PM Constants ──
  const PLANT_CONDITIONS = [
    { value: 'operating', label: 'Operating', color: '#10B981' },
    { value: 'stopped', label: 'Stopped', color: '#EF4444' },
  ];

  const PRIORITIES = [
    { value: 'P1', label: 'P1 (I) - Immediate', sub: '< 24h', color: '#EF4444', bg: '#FEE2E2', claseOT: 'PM03' },
    { value: 'P2', label: 'P2 (A) - High', sub: '< 7 days', color: '#F97316', bg: '#FED7AA', claseOT: 'PM03' },
    { value: 'P3', label: 'P3 (M) - Medium', sub: '> 7 days', color: '#EAB308', bg: '#FEF3C7', claseOT: 'PM01' },
    { value: 'P4', label: 'P4 (B) - Low', sub: 'Plant Shutdown', color: '#3B82F6', bg: '#DBEAFE', claseOT: 'PM01' },
  ];

  const ACTIVITY_CLASSES = {
    PM01: [
      { value: 'M001', label: 'Maintenance Request' },
      { value: 'M002', label: 'Avería' },
    ],
    PM03: [
      { value: 'M001', label: 'Maintenance Request' },
      { value: 'M002', label: 'Avería' },
    ],
  };

  const FAILURE_CATALOG = {
    MECHANICAL: {
      label: 'Mechanical', color: '#6366F1',
      symptoms: ['HIGH VIBRATION', 'HIGH TEMPERATURE', 'ABNORMAL NOISE', 'SEIZED', 'NO FLOW', 'LEAKAGE', 'VISIBLE WEAR', 'OIL LEAK', 'BLOCKAGE', 'CAVITATION', 'LOW PRESSURE', 'EXCESSIVE PLAY', 'MISALIGNMENT DETECTED', 'ABNORMAL OIL ANALYSIS', 'REDUCED OUTPUT'],
      parts: ['BEARINGS', 'MECHANICAL SEALS', 'COUPLINGS', 'SHAFTS', 'GEARS', 'BELTS', 'PUMPS', 'VALVES', 'FILTERS', 'IMPELLER', 'REDUCER/GEARBOX', 'PISTON/CYLINDER', 'LINER/WEAR PLATE', 'CRUSHER JAW', 'CONVEYOR IDLER', 'SCREEN PANEL', 'CYCLONE', 'AGITATOR', 'COMPRESSOR', 'HEAT EXCHANGER', 'TANK/VESSEL', 'PIPING', 'HYDRAULIC CYLINDER', 'PNEUMATIC ACTUATOR'],
      causes: ['WEAR', 'LACK OF LUBRICATION', 'CORROSION', 'MISALIGNMENT', 'BLOCKED', 'OVERLOAD', 'FATIGUE', 'INCORRECT ASSEMBLY', 'CAVITATION', 'CONTAMINATION', 'THERMAL STRESS', 'ABRASION', 'EROSION', 'IMPACT', 'VIBRATION DAMAGE', 'SEAL FAILURE', 'BEARING FAILURE'],
    },
    ELECTRICAL: {
      label: 'Electrical', color: '#F59E0B',
      symptoms: ['WONT START', 'OVERHEATING', 'SHORT CIRCUIT', 'PROTECTION TRIP', 'LOW INSULATION', 'INTERMITTENT OPERATION', 'EXCESSIVE CONSUMPTION', 'ARC FLASH', 'VOLTAGE DROP', 'GROUND FAULT', 'PHASE IMBALANCE', 'HARMONIC DISTORTION'],
      parts: ['ELECTRIC MOTOR', 'CABLES / CONDUCTORS', 'PROTECTIONS', 'ELECTRICAL PANEL', 'VARIABLE FREQUENCY DRIVE', 'CONTACTOR', 'TRANSFORMER', 'SWITCHGEAR', 'CIRCUIT BREAKER', 'RELAY', 'BUSBAR', 'CAPACITOR BANK', 'UPS', 'GENERATOR', 'SOFT STARTER', 'POWER SUPPLY'],
      causes: ['INSULATION LOSS', 'WEAR', 'LOOSE CONNECTION', 'ELECTRICAL OVERLOAD', 'MOISTURE', 'EXCESSIVE HEATING', 'ELECTRICAL SURGE', 'SHORT CIRCUIT', 'AGING', 'CONTAMINATION', 'INCORRECT WIRING', 'HARMONIC DAMAGE'],
    },
    INSTRUMENTATION: {
      label: 'Instrumentation', color: '#06B6D4',
      symptoms: ['ERRONEOUS READING', 'NO SIGNAL', 'UNSTABLE SIGNAL', 'NOT RESPONDING', 'FALSE ALARM', 'LOST COMMUNICATION', 'DRIFT', 'STUCK VALUE', 'INTERMITTENT SIGNAL', 'DELAYED RESPONSE'],
      parts: ['SENSOR / TRANSDUCER', 'TRANSMITTER', 'CONTROL VALVE', 'PLC / DCS', 'ACTUATOR', 'POSITIONER', 'FLOW METER', 'LEVEL SENSOR', 'PRESSURE GAUGE', 'TEMPERATURE PROBE', 'ANALYZER', 'SOLENOID VALVE', 'I/P CONVERTER', 'SAFETY RELAY', 'PROXIMITY SWITCH', 'ENCODER'],
      causes: ['OUT OF CALIBRATION', 'CONTAMINATED', 'PARAMETER LOSS', 'COMMUNICATION LOSS', 'OBSTRUCTION', 'CORROSION', 'VIBRATION DAMAGE', 'ELECTRICAL INTERFERENCE', 'MEMBRANE DAMAGE', 'BLOCKED IMPULSE LINE'],
    },
    HYDRAULIC: {
      label: 'Hydraulic', color: '#EF4444',
      symptoms: ['LOW PRESSURE', 'OVERHEATING', 'LEAKAGE', 'SLOW RESPONSE', 'CAVITATION NOISE', 'FOAMING', 'CONTAMINATED OIL', 'CYLINDER DRIFT'],
      parts: ['HYDRAULIC PUMP', 'HYDRAULIC CYLINDER', 'DIRECTIONAL VALVE', 'PRESSURE RELIEF VALVE', 'ACCUMULATOR', 'HYDRAULIC MOTOR', 'FILTER', 'RESERVOIR', 'HOSE / FITTING', 'MANIFOLD'],
      causes: ['CONTAMINATION', 'SEAL WEAR', 'CAVITATION', 'OVERHEATING', 'AIR IN SYSTEM', 'INCORRECT FLUID', 'EXCESSIVE PRESSURE', 'INTERNAL LEAKAGE'],
    },
    STRUCTURAL: {
      label: 'Structural', color: '#8B5CF6',
      symptoms: ['CRACK DETECTED', 'DEFORMATION', 'CORROSION VISIBLE', 'BOLT LOOSENING', 'FOUNDATION SETTLEMENT', 'EXCESSIVE DEFLECTION'],
      parts: ['STEEL STRUCTURE', 'FOUNDATION', 'SUPPORT BEAM', 'PLATFORM / WALKWAY', 'HANDRAIL / GUARD', 'HOPPER / CHUTE', 'DUCT / ENCLOSURE', 'ANCHOR BOLT'],
      causes: ['FATIGUE', 'CORROSION', 'OVERLOAD', 'IMPACT', 'VIBRATION', 'POOR WELDING', 'SETTLEMENT', 'THERMAL EXPANSION'],
    },
  };

  
  const [showExtModal, setShowExtModal] = useState(false);
  const [showExtMatModal, setShowExtMatModal] = useState(false);
  const [showExtResModal, setShowExtResModal] = useState(false);
  const [extResIdx, setExtResIdx] = useState(-1);
  const [extResForm, setExtResForm] = useState({ specialty: '', vendor: '', vendor_other: '', contract_ref: '', rate_per_hour: '', estimated_hours: '', estimated_cost: '', notes: '' });

  const [extMatIdx, setExtMatIdx] = useState(-1);
  const [extMatForm, setExtMatForm] = useState({ description: '', vendor: '', vendor_other: '', part_number: '', estimated_cost: '', lead_time_days: '', notes: '' });

  const [extForm, setExtForm] = useState({ service: '', vendor: '', vendor_other: '', contract_ref: '', specialty: '', specialty_other: '', estimated_cost: '', duration_days: '', notes: '' });

  const SPECIAL_EQUIPMENT = [
    'Grua 20 Ton', 'Grua 50 Ton', 'Grua Horquilla', 'Andamio Multidireccional',
    'Tubular Scaffold', 'Crane Truck', 'Lift Platform', 'MIG/MAG Welder',
    'TIG Welder', 'Arc Welder', 'Portable Compressor', 'Electric Generator',
    'Bomba Sumergible', 'Hidrolavadora', 'Equipo Alineacion Laser',
    'Analizador de Vibraciones', 'Camara Termografica', 'Megohmetro',
    'Industrial Multimeter', 'Torque Wrench', 'Hydraulic Puller',
    'Hydraulic Jack', 'Chain Hoist 5 Ton', 'Angle Grinder',
    'Magnetic Drill', 'Ultrasound Equipment', 'Gas Detector',
  ];

  const RESOURCE_TYPES = [
    'Mechanical', 'Electrical', 'Instrumentation', 'Lubrication', 'Soldador',
    'Crane Operator', 'Scaffolder', 'Boilermaker', 'General Helper', 'Rigger',
  ];

  const COMMON_MATERIALS = [
    { sapId: '10001234', desc: 'Bearing SKF 6205' },
    { sapId: '10001235', desc: 'Mechanical Seal' },
    { sapId: '10001236', desc: 'V-Belt A-68' },
    { sapId: '10001237', desc: 'Oil ISO 68' },
    { sapId: '10001238', desc: 'Grease EP2' },
    { sapId: '10001239', desc: 'Hydraulic Oil Filter' },
    { sapId: '10001240', desc: 'O-Ring NBR' },
    { sapId: '10001241', desc: 'Bolt M12x50 Gr8.8' },
    { sapId: '10001242', desc: 'Electrode E7018 3/32' },
    { sapId: '10001243', desc: 'Cable 3x10 AWG' },
    { sapId: '10001244', desc: 'Fuse NH 100A' },
    { sapId: '10001245', desc: 'Contactor 3P 40A' },
    { sapId: '10001246', desc: 'Inductive Proximity Sensor' },
    { sapId: '10001247', desc: 'Pressure Transmitter 0-10bar' },
    { sapId: '10001248', desc: 'Solenoid Valve 1/2"' },
  ];

  // ── BBP SAP PM Master Data (AMSA_BBP_PM_04) ──
  const AVISO_CLASSES = [
    { value: 'A1', label: 'A1 - Maintenance Notification', desc: 'Corrective / Request' },
    { value: 'A2', label: 'A2 - Predictive & Eng. Notification', desc: 'Predictive / Engineering' },
    { value: 'A3', label: 'A3 - Preventive Plan Notification', desc: 'Maintenance Plan' },
  ];

  const AVISO_CODING = {
    A1: [
      { value: 'M001', label: 'M001 - Maintenance Request' },
      { value: 'M002', label: 'M002 - Breakdown' },
    ],
    A2: [
      { value: 'P001', label: 'P001 - Predictive' },
      { value: 'P002', label: 'P002 - Engineering' },
    ],
    A3: [],
  };

  const PLANNING_GROUPS = [
    { value: 'P01', label: 'P01 - Dry Area Plant', area: 'Plant' },
    { value: 'P02', label: 'P02 - Heap Leach Area', area: 'Plant' },
    { value: 'P03', label: 'P03 - Wet Area Plant', area: 'Plant' },
    { value: 'M01', label: 'M01 - Mine Drilling', area: 'Mine' },
    { value: 'M02', label: 'M02 - Mine Loading', area: 'Mine' },
    { value: 'M03', label: 'M03 - Mine Hauling', area: 'Mine' },
    { value: 'M04', label: 'M04 - Mina Support Equipment', area: 'Mine' },
    { value: 'M05', label: 'M05 - Mine Auxiliary Equipment', area: 'Mine' },
  ];

  const AREAS_EMPRESA = [
    { value: 'SEC', label: 'Dry Area' },
    { value: 'HUM', label: 'Wet Area' },
    { value: 'RIP', label: 'Heap Leach Area' },
    { value: 'PER', label: 'Drilling' },
    { value: 'CAR', label: 'Loading' },
    { value: 'TRA', label: 'Hauling' },
    { value: 'APO', label: 'Support' },
    { value: 'AUX', label: 'Auxiliary' },
    { value: 'TAL', label: 'Workshop' },
  ];

  const WORK_CENTERS = [
    { value: 'PASMEC01', label: 'Mechanical Dry Area', area: 'P01' },
    { value: 'PASELE01', label: 'Electrical Dry Area', area: 'P01' },
    { value: 'PASINS01', label: 'Instrumentation Dry Area', area: 'P01' },
    { value: 'PASLUB01', label: 'Lubrication Dry Area', area: 'P01' },
    { value: 'PARELE01', label: 'Electrical Heap Leach', area: 'P02' },
    { value: 'PARINS01', label: 'Instrumentation Heap Leach', area: 'P02' },
    { value: 'PAHMEC01', label: 'Mechanical Wet Area', area: 'P03' },
    { value: 'PAHELE01', label: 'Electrical Wet Area', area: 'P03' },
    { value: 'PAHINS01', label: 'Instrumentation Wet Area', area: 'P03' },
    { value: 'PSHSIN01', label: 'Synoptic', area: 'P01' },
    { value: 'PSHDCS01', label: 'DCS & Automation', area: 'P01' },
    { value: 'MPCMEC01', label: 'Mechanical Drilling & Loading', area: 'M01' },
    { value: 'MTAMEC01', label: 'Mechanical Hauling & Support', area: 'M03' },
    { value: 'MPCELE01', label: 'Electrical Drilling & Loading', area: 'M01' },
    { value: 'MTAELE01', label: 'Electrical Hauling & Support', area: 'M03' },
    { value: 'MPREDI01', label: 'Predictive', area: 'M01' },
    { value: 'MEXTSOL1', label: 'Welding (Ext)', area: 'M04' },
    { value: 'MEXTLAV1', label: 'Washing (Ext)', area: 'M04' },
    { value: 'MEXTNEU1', label: 'Tires (Ext)', area: 'M04' },
    { value: 'MEXTCAB1', label: 'Cabina (Ext)', area: 'M04' },
    { value: 'MEXTSCI1', label: 'Sistema Contra Incendios (Ext)', area: 'M04' },
    { value: 'MEXTGET1', label: 'Elemento de Desgaste (Ext)', area: 'M04' },
  ];

  const SAP_PRIORITY_MAP = {
    P1: { sap: 'I', label: 'Immediate', days: '< 24h' },
    P2: { sap: 'A', label: 'High', days: '< 7 days' },
    P3: { sap: 'M', label: 'Medium', days: '> 7 days' },
    P4: { sap: 'B', label: 'Low', days: 'Plant Shutdown' },
  };

  const ORDER_TYPES = [
    { value: 'PM01', label: 'PM01 - Breakdown Maintenance Order' },
    { value: 'PM02', label: 'PM02 - Preventive Maintenance Order' },
    { value: 'PM03', label: 'PM03 - Maintenance Service Order' },
    { value: 'PM06', label: 'PM06 - Investment Order' },
    { value: 'PM07', label: 'PM07 - Component Repair Order' },
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
    equipmentCondition: 'operating',
    failureCategory: 'MECHANICAL',
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
  const [equipFromLocation, setEquipFromLocation] = useState(false); // true when results come from location selection
  const [selectedEquip, setSelectedEquip] = useState(null);

  // Location search
  const [locSearch, setLocSearch] = useState('');
  const [locResults, setLocResults] = useState([]);
  const [showLocSearch, setShowLocSearch] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseSearch, setBrowseSearch] = useState("");
  const [browseResults, setBrowseResults] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browsePath, setBrowsePath] = useState([]);  // [{node_id, name, node_type}]

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
  const [visionResult, setVisionResult] = useState(null);
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
      // Jorge (2026-04-20 tarde): la IA tiene que recibir condición de equipo
      // y prioridad como INPUT, así sus sugerencias (sobre todo acciones)
      // respetan si el equipo está operando o detenido.
      const res = await suggestFailureFields({
        description: desc,
        equipment_tag: form.whereTag || form.equipmentTag,
        equipment_name: form.whereName || form.equipmentName,
        equipment_condition: form.equipmentCondition || 'operating',
        priority_hint: form.priority || null,
      });
      if (res?.suggestions) {
        const s = res.suggestions;
        // Helper: fuzzy match against catalog array (exact first, then includes)
        const fuzzyMatch = (val, arr) => {
          if (!val || !arr) return null;
          const v = val.toUpperCase().trim();
          const exact = arr.find(a => a === v);
          if (exact) return exact;
          const partial = arr.find(a => a.includes(v) || v.includes(a));
          if (partial) return partial;
          // Word overlap: pick best match
          const vWords = v.split(/[\s/]+/);
          let best = null, bestScore = 0;
          for (const a of arr) {
            const score = vWords.filter(w => a.includes(w)).length;
            if (score > bestScore) { bestScore = score; best = a; }
          }
          return bestScore > 0 ? best : null;
        };

        // Helper: strip numeric TAGs from text
        const stripNumericTags = (text) => (text || '').replace(/\b0{3,}\d+\b/g, '').replace(/\(TAG\s*\)/gi, '').replace(/TAG\s+\d{5,}/gi, '').replace(/\s{2,}/g, ' ').trim();

        if (s.failure_category || s.failureCategory) {
          const cat = (s.failure_category || s.failureCategory).toUpperCase().trim();
          const validCats = ['MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION', 'HYDRAULIC', 'STRUCTURAL'];
          if (validCats.includes(cat)) setF('failureCategory', cat);
          else if (cat.includes('MEC')) setF('failureCategory', 'MECHANICAL');
          else if (cat.includes('ELEC')) setF('failureCategory', 'ELECTRICAL');
          else if (cat.includes('INST')) setF('failureCategory', 'INSTRUMENTATION');
          else if (cat.includes('HYD')) setF('failureCategory', 'HYDRAULIC');
          else if (cat.includes('STRU')) setF('failureCategory', 'STRUCTURAL');
        }
        // Determine active category for catalog lookups
        const activeCat = FAILURE_CATALOG[(s.failure_category || s.failureCategory || form.failureCategory || 'MECHANICAL').toUpperCase()] || FAILURE_CATALOG.MECHANICAL;

        if (s.failure_symptom || s.failureSymptom) {
          const matched = fuzzyMatch(s.failure_symptom || s.failureSymptom, activeCat.symptoms);
          if (matched) setF('failureSymptom', matched);
        }
        if (s.failure_cause || s.failureCause) {
          const matched = fuzzyMatch(s.failure_cause || s.failureCause, activeCat.causes);
          if (matched) setF('failureCause', matched);
        }
        if (s.failure_object_part || s.failureObjectPart) {
          const matched = fuzzyMatch(s.failure_object_part || s.failureObjectPart, activeCat.parts);
          if (matched) setF('failureObjectPart', matched);
        }
        // Store AI enhanced description separately — do NOT overwrite user's original text
        if (s.enhanced_description) setF('aiEnhancedDescription', stripNumericTags(s.enhanced_description));
        if (s.suggestedAction || s.suggested_action) setF('suggestedAction', stripNumericTags(s.suggestedAction || s.suggested_action));
        // Auto-generate WO title = main corrective action (not step 1, but the principal action)
        // Use AI's main_action field if available, otherwise extract from original text
        if (s.main_action || s.mainAction) {
          let title = stripNumericTags(s.main_action || s.mainAction).trim();
          if (title.length > 70) title = title.substring(0, 70).replace(/\s+\S*$/, '');
          setF('woTitle', title);
        } else if (s.enhanced_description) {
          // Fallback: extract main verb+object from enhanced description
          let title = stripNumericTags(s.enhanced_description).split(/[.,;]/)[0].trim();
          if (title.length > 70) title = title.substring(0, 70).replace(/\s+\S*$/, '');
          setF('woTitle', title);
        }
        if (s.activityClass || s.activity_class) setF('activityClass', s.activityClass || s.activity_class);
        if (s.priority) setF('priority', s.priority);
        if (s.estimatedDuration || s.estimated_duration) setF('estimatedDuration', String(s.estimatedDuration || s.estimated_duration));
        if (s.equipmentCondition || s.equipment_condition) {
          const pc = (s.equipmentCondition || s.equipment_condition).toLowerCase();
          setF('equipmentCondition', pc === 'running' ? 'operating' : pc === 'stopped' ? 'stopped' : pc);
        }
        // P1/P2 or critical symptoms → equipment must be stopped
        const criticalSymptoms = ['SEIZED', 'SHORT CIRCUIT', 'ARC FLASH', 'CRACK DETECTED', 'LEAKAGE'];
        const symptomVal = (s.failure_symptom || s.failureSymptom || '').toUpperCase();
        if (s.priority === 'P1' || s.priority === 'P2' || criticalSymptoms.some(cs => symptomVal.includes(cs))) {
          setF('equipmentCondition', 'stopped');
        }
        ensureRealisticResources(s.resources, s.materials, s.failureCategory, s.estimatedDuration || s.estimated_duration, s.enhanced_description);
        if (s.supportEquipment?.length) setF('supportEquipment', s.supportEquipment);
        if (s.support_equipment?.length) setF('supportEquipment', s.support_equipment);
        if (s.workConditions || s.work_conditions) setF('workConditions', s.workConditions || s.work_conditions);
        // SF-41: If AI identified equipment_tag and none selected yet, auto-select it
        if (s.equipment_tag && !selectedEquip) {
          const matched = allEquipment.find(n => {
            const tag = (n.tag || n.code || '').toUpperCase();
            return tag === s.equipment_tag.toUpperCase();
          });
          if (matched) selectEquip(matched);
          else if (s.equipment_tag !== 'null') {
            setF('whereTag', s.equipment_tag);
            setEquipSearch(s.equipment_tag);
          }
        }
        // Count pre-filled fields for user feedback
        const filled = [s.enhanced_description, s.failureCategory, s.priority, s.failureSymptom, s.failureCause, s.failureObjectPart, s.suggestedAction, s.equipment_tag].filter(Boolean).length;
        if (filled > 0) toast.success(`AI pre-filled ${filled} fields from your description`);
        setAiSuggested(true);
      }
    } catch (e) {
      console.error('AI suggest failed:', e);
      alert('Error connecting to AI. Check server configuration.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Load equipment + location nodes ──
  const buildFuncLocPath = useCallback((node, nodeMap) => {
    // If node already has sap_func_loc, use it directly
    if (node.sap_func_loc) return node.sap_func_loc;
    // Otherwise use the node's own code (already contains the full path in most seed data)
    return node.code || node.name || '';
  }, []);

  useEffect(() => {
    // Load locations (PLANT + AREA + top SYSTEM) and equipment separately
    Promise.all([
      api.listNodes({ limit: 300, plant_id: plant }).catch(() => []),
      api.listNodes({ node_type: 'EQUIPMENT', limit: 500, plant_id: plant }).catch(() => []),
    ]).then(([locRes, eqRes]) => {
      const locs = Array.isArray(locRes) ? locRes : locRes?.items || [];
      const eqs = Array.isArray(eqRes) ? eqRes : eqRes?.items || [];
      const allN = [...locs, ...eqs.filter(e => !locs.find(l => l.node_id === e.node_id))];
      setAllNodes(allN);
      const nodeMap = {};
      allN.forEach(n => { nodeMap[n.node_id] = n; });
      setAllEquipment(allN.filter(n => n.node_type === 'EQUIPMENT'));
      setLocationNodes(allN.filter(n =>
        ['PLANT', 'AREA', 'SYSTEM'].includes(n.node_type)
      ).map(n => ({ ...n, _funcLoc: buildFuncLocPath(n, nodeMap) })));
    });
  }, [buildFuncLocPath, plant]);

  // Filter equipment results
  useEffect(() => {
    if (equipSearch.length === 0) {
      if (!equipFromLocation) {
        // If a location is selected, only show equipment under that location's code prefix
        const locCode = selectedLoc?.code || selectedLoc?._funcLoc || '';
        if (locCode) {
          const locPrefix = locCode.toUpperCase();
          const filtered = allEquipment.filter(n => (n.code || '').toUpperCase().startsWith(locPrefix));
          setEquipResults(filtered.length > 0 ? filtered.slice(0, 30) : []);
        } else {
          setEquipResults(allEquipment.slice(0, 20));
        }
      }
      return;
    }
    if (equipSearch.length < 2) { setEquipResults([]); return; }
    setEquipFromLocation(false);
    const timer = setTimeout(() => {
      // Search scoped to selected location if available
      const locCode = selectedLoc?.code || '';
      const searchParams = { search: equipSearch, node_type: 'EQUIPMENT', limit: 20, plant_id: plant };
      if (locCode) searchParams.parent_node_id_prefix = locCode;
      api.listNodes(searchParams).then(res => {
        const nodes = Array.isArray(res) ? res : res?.items || [];
        // Filter client-side by location prefix if server doesn't support it
        const locPrefix = locCode.toUpperCase();
        const filtered = locPrefix ? nodes.filter(n => (n.code || '').toUpperCase().startsWith(locPrefix)) : nodes;
        setEquipResults(filtered.length > 0 ? filtered : nodes.slice(0, 15));
      }).catch(() => {
        const q = equipSearch.toLowerCase();
        const locPrefix = locCode.toUpperCase();
        setEquipResults(allEquipment.filter(n => {
          const matchesSearch = (n.tag || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q);
          const matchesLoc = !locPrefix || (n.code || '').toUpperCase().startsWith(locPrefix);
          return matchesSearch && matchesLoc;
        }).slice(0, 15));
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [equipSearch, allEquipment, selectedLoc]);

  // Filter location results
  useEffect(() => {
    if (!locSearch) { setLocResults(locationNodes.slice(0, 15)); return; }
    const q = locSearch.toLowerCase();
    setLocResults(locationNodes.filter(n =>
      (n._funcLoc || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [locSearch, locationNodes]);


  // Browse all locations - drill-down navigation
  const openBrowseModal = () => {
    setShowBrowseModal(true);
    setBrowseSearch('');
    setBrowsePath([]);
    loadBrowseChildren(null, '');
  };
  const loadBrowseChildren = (parentId, search, autoSelectIfEmpty = null) => {
    setBrowseLoading(true);
    const params = { limit: 500 };
    if (parentId) params.parent_node_id = parentId;
    else params.node_type = 'PLANT';
    if (search) params.search = search;
    params.plant_id = plant; api.listNodes(params).then(res => {
      const nodes = Array.isArray(res) ? res : res?.items || [];
      setBrowseResults(nodes);
      setBrowseLoading(false);
      // Jorge 2026-04-22 — si drill-down llega a un leaf (sin hijos), auto-seleccionar.
      // Antes Jorge pensaba que al llegar al leaf ya había seleccionado y cerraba el modal.
      if (autoSelectIfEmpty && nodes.length === 0 && !search) {
        selectBrowseLocation(autoSelectIfEmpty);
      }
    }).catch(() => { setBrowseResults([]); setBrowseLoading(false); });
  };
  const drillDown = (node) => {
    setBrowsePath(prev => [...prev, { node_id: node.node_id, name: node.name, node_type: node.node_type }]);
    setBrowseSearch('');
    // Si es un tipo terminal (EQUIPMENT/SUB_ASSEMBLY/MAINTAINABLE_ITEM) y no tiene hijos,
    // auto-select. Los tipos contenedores (PLANT/AREA/SYSTEM) siguen mostrando el botón
    // por si realmente están vacíos en la data.
    const isTerminal = ['EQUIPMENT', 'SUB_ASSEMBLY', 'MAINTAINABLE_ITEM'].includes(node.node_type);
    loadBrowseChildren(node.node_id, '', isTerminal ? node : null);
  };
  const drillUp = (index) => {
    if (index < 0) {
      setBrowsePath([]);
      loadBrowseChildren(null, '');
    } else {
      const newPath = browsePath.slice(0, index + 1);
      setBrowsePath(newPath);
      loadBrowseChildren(newPath[newPath.length - 1].node_id, '');
    }
  };
  useEffect(() => {
    if (!showBrowseModal) return;
    const timer = setTimeout(() => {
      const parentId = browsePath.length > 0 ? browsePath[browsePath.length - 1].node_id : null;
      loadBrowseChildren(parentId, browseSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [browseSearch]);
  const selectBrowseLocation = (node) => {
    selectLocation(node);
    setShowBrowseModal(false);
  };

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
    // Duplicates checked only after AI analysis (not on equipment selection per client feedback)
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
    const funcLoc = node._funcLoc || node.sap_func_loc || node.code || '';
    setF('technicalLocationCode', funcLoc);
    setShowLocSearch(false);
    setLocSearch('');
    // If selected an EQUIPMENT, auto-fill Equipo/TAG
    if (node.node_type === 'EQUIPMENT') {
      selectEquip(node);
    } else {
      // Load children equipment for this location
      api.listNodes({ parent_node_id: node.node_id, limit: 500, plant_id: plant }).then(res => {
        const children = Array.isArray(res) ? res : res?.items || [];
        // Get all equipment from children (direct + nested)
        const equipList = children.filter(n => n.node_type === 'EQUIPMENT');
        if (equipList.length > 0) {
          setEquipResults(equipList);
          setEquipFromLocation(true);
          setShowEquipSearch(true);
        } else if (children.length > 0) {
          // Recursively search up to 3 levels deep for equipment
          const childIds = children.map(c => c.node_id);
          Promise.all(childIds.slice(0, 15).map(id => api.listNodes({ parent_node_id: id, limit: 200, plant_id: plant }).catch(() => []))).then(results => {
            const allLevel2 = results.flatMap(r => Array.isArray(r) ? r : r?.items || []);
            const equips2 = allLevel2.filter(n => n.node_type === 'EQUIPMENT');
            if (equips2.length > 0) {
              setEquipResults(equips2);
              setEquipFromLocation(true);
              setShowEquipSearch(true);
            } else if (allLevel2.length > 0) {
              // Go one more level deep (level 3)
              const level2Ids = allLevel2.map(c => c.node_id);
              Promise.all(level2Ids.slice(0, 20).map(id => api.listNodes({ parent_node_id: id, limit: 200, plant_id: plant }).catch(() => []))).then(res3 => {
                const allLevel3 = res3.flatMap(r => Array.isArray(r) ? r : r?.items || []);
                const equips3 = allLevel3.filter(n => n.node_type === 'EQUIPMENT');
                if (equips3.length > 0) {
                  setEquipResults(equips3);
                  setEquipFromLocation(true);
                  setShowEquipSearch(true);
                }
              });
            }
          });
        }
      }).catch(() => {});
    }
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
  const handleVoice = async () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (!SpeechRecognition) {
      // Fallback: record audio and send to backend (Claude/Whisper transcription)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          toast.info('Transcribing with AI...');
          try {
            // Ver comentario en recognition.lang: el idioma de voz es
            // independiente del UI language. Default es.
            const stored = localStorage.getItem('voice_lang') || 'es-ES';
            const lang = stored.startsWith('en') ? 'en' : 'es';
            const res = await api.transcribeAudio(blob, lang);
            const text = res.text || res.transcription || '';
            if (text) {
              setF('whatHappens', text);
              toast.success('Voice transcribed — AI analyzing...');
              handleAiSuggest(text);
            } else {
              toast.error('No speech detected');
            }
          } catch (err) { toast.error('Transcription failed: ' + err.message); }
        };
        mediaRecorder.start();
        setIsRecording(true);
        recognitionRef.current = { stop: () => mediaRecorder.stop() };
        toast.info('Recording... click again to stop');
      } catch (e) {
        toast.error('Microphone access denied');
      }
      return;
    }

    // Use native Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // El idioma de reconocimiento es INDEPENDIENTE del idioma de la UI.
    // El operador siempre habla el idioma local (default es-ES para minería
    // LATAM/España). Override via localStorage 'voice_lang' si hace falta.
    recognition.lang = localStorage.getItem('voice_lang') || 'es-ES';
    recognitionRef.current = recognition;

    let finalTranscript = '';
    const baseText = (form.whatHappens || '').trim();

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      // Live update textarea with what's being said
      const newText = (finalTranscript + interim).trim();
      if (newText) setF('whatHappens', baseText ? baseText + ' ' + newText : newText);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') toast.error('Speech error: ' + event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      const fullText = (baseText ? baseText + ' ' : '') + finalTranscript.trim();
      if (finalTranscript.trim()) {
        setF('whatHappens', fullText);
        toast.success('Voice captured — AI analyzing...');
        handleAiSuggest(fullText);
      }
    };

    setIsRecording(true);
    recognition.start();
    toast.info('Listening... speak now');
  };


  const handleCameraClick = () => cameraRef.current?.click();
  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newPhoto = ev.target.result;
      setPhotos(prev => {
        const updated = [...prev, newPhoto];
        // SF-215: Auto-trigger vision analysis after photo capture
        setTimeout(() => autoAnalyzePhoto(updated), 300);
        return updated;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';

    // GPS auto-detect: check device location and suggest nearest equipment
    if (navigator.geolocation && !form.technicalLocationCode) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const nearby = await api.getNearbyAssets(pos.coords.latitude, pos.coords.longitude, 500);
          if (nearby && nearby.length > 0) {
            const best = nearby[0];
            if (best.tag && best.tag !== form.whereTag) {
              const confirmed = window.confirm(
                'GPS detected nearby equipment: ' + (best.name || best.tag) +
                  ' (' + Math.round(best.distance_m) + 'm away). Use this location?'
              );
              if (confirmed) {
                setF('whereTag', best.tag);
                setF('technicalLocationCode', best.sap_func_loc || best.code || best.tag);
                setF('technicalLocation', best.name || best.tag);
                setSelectedEquip(best);
                toast.success('Location updated: ' + (best.name || best.tag));
              }
            }
          }
        } catch { /* GPS lookup failed silently */ }
      }, () => {}, { enableHighAccuracy: true, timeout: 5000 });
    }
  };

  // SF-215: Auto-analyze photo with Vision AI
  const autoAnalyzePhoto = async (photoList) => {
    if (!photoList || photoList.length === 0) return;
    setVisionLoading(true);
    setVisionResult(null);
    toast.info('AI analyzing image...');
    try {
      const res = await aiAssistImage({
        images: photoList,
        equipment_tag: form.whereTag || form.equipmentTag || '',
        additional_context: form.whatHappens || '',
      });
      if (res?.suggestions) {
        const s = res.suggestions;
        setVisionResult({
          equipment_identified: s.equipment_identified || s.equipmentType || 'Unknown equipment',
          failure_type: s.failure_type || s.failureCategory || '',
          severity: s.severity || 'medium',
          description: s.whatHappens || '',
          suggested_action: s.suggestedAction || '',
          confidence: res.confidence || 0.85,
          raw: s,
        });
        toast.success('AI identified: ' + (s.equipment_identified || s.equipmentType || 'equipment'));
      }
    } catch (e) {
      console.error('Auto vision analysis error:', e);
      toast.error('AI photo analysis failed');
    } finally {
      setVisionLoading(false);
    }
  };

  // SF-215: Accept AI vision suggestions and pre-fill form
  const acceptVisionSuggestions = () => {
    if (!visionResult?.raw) return;
    const s = visionResult.raw;
    if (s.whatHappens) setF('whatHappens', s.whatHappens);
    if (s.failureCategory) {
      const cat = s.failureCategory.toUpperCase().trim();
      if (['MECHANICAL','ELECTRICAL','INSTRUMENTATION','HYDRAULIC','STRUCTURAL'].includes(cat)) setF('failureCategory', cat);
    }
    if (s.priority) setF('priority', s.priority);
    if (s.activityClass) setF('activityClass', s.activityClass);
    if (s.suggestedAction) setF('suggestedAction', s.suggestedAction);
    const aiCat = (s.failureCategory || form.failureCategory || 'MECHANICAL').toUpperCase();
    const catData = FAILURE_CATALOG[aiCat] || FAILURE_CATALOG.MECHANICAL;
    if (catData) {
      if (s.failureSymptom) {
        const sym = s.failureSymptom.toUpperCase().trim();
        if (catData.symptoms?.includes(sym)) setF('failureSymptom', sym);
      }
      if (s.failureCause) {
        const cau = s.failureCause.toUpperCase().trim();
        if (catData.causes?.includes(cau)) setF('failureCause', cau);
      }
      if (s.failureObjectPart) {
        const part = s.failureObjectPart.toUpperCase().trim();
        if (catData.parts?.includes(part)) setF('failureObjectPart', part);
      }
    }
    if (s.estimatedDuration) setF('estimatedDuration', String(s.estimatedDuration));
    if (s.equipmentCondition) {
      const vpc = s.equipmentCondition.toLowerCase();
      setF('equipmentCondition', vpc === 'running' ? 'operating' : vpc === 'stopped' ? 'stopped' : vpc);
    }
    ensureRealisticResources(s.resources, s.materials, s.failureCategory, s.estimatedDuration || s.estimated_duration, s.enhanced_description);
    if (s.supportEquipment?.length) setF('supportEquipment', s.supportEquipment);
    if (s.workConditions) setF('workConditions', s.workConditions);
    // Try to match equipment_identified with known equipment list
    if (s.equipment_identified && allEquipment.length > 0 && !form.whereTag) {
      const eqName = (s.equipment_identified || '').toLowerCase();
      const match = allEquipment.find(eq => {
        const name = (eq.name || '').toLowerCase();
        const tag = (eq.tag || '').toLowerCase();
        return name.includes(eqName) || eqName.includes(name) || eqName.includes(tag);
      });
      if (match) setDetectedEquipment(match);
    }
    setAiSuggested(true);
    setVisionResult(null);
    toast.success('AI suggestions applied to form');
  };

  const dismissVisionResult = () => setVisionResult(null);

  const handleVisionAnalysis = async () => {
    if (photos.length === 0) { toast.error('Upload at least one photo'); return; }
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
          if (['MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION'].includes(cat)) setF('failureCategory', cat);
        }
        if (s.priority) setF('priority', s.priority);
        if (s.activityClass) setF('activityClass', s.activityClass);
        if (s.suggestedAction) setF('suggestedAction', s.suggestedAction);
        // Validate catalog values against FAILURE_CATALOG
        const aiCat = (s.failureCategory || form.failureCategory || 'MECHANICAL').toUpperCase();
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
        if (s.equipmentCondition) {
          const vpc = s.equipmentCondition.toLowerCase();
          setF('equipmentCondition', vpc === 'running' ? 'operating' : vpc === 'stopped' ? 'stopped' : vpc);
        }
        ensureRealisticResources(s.resources, s.materials, s.failureCategory, s.estimatedDuration || s.estimated_duration, s.enhanced_description);
        if (s.supportEquipment?.length) setF("supportEquipment", s.supportEquipment);
        if (s.workConditions) setF("workConditions", s.workConditions);
        setAiSuggested(true);
        toast.success('Photos analyzed by AI - fields auto-filled');
      }
    } catch (e) {
      console.error('Vision AI error:', e);
      toast.error('Error analyzing photos with AI');
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

  // ── Ensure realistic resource allocation based on failure category ──
  const ensureRealisticResources = (aiResources, aiMaterials, category, duration, descText) => {
    let res = (aiResources || []).filter(r => !/supervisor/i.test(r.type || r));
    const hasType = (t) => res.some(r => (r.type || '').toLowerCase().includes(t.toLowerCase()));
    const cat = (category || '').toUpperCase();
    const dur = parseFloat(duration || 4);
    const dl = (descText || '').toLowerCase();
    const isHeavy = /compresor|pump|bomba|motor|crusher|chancador|molino|mill|turbina|ventilador|fan/i.test(dl);

    if (cat === 'MECHANICAL' || cat === 'HYDRAULIC') {
      if (!hasType('Mechanical')) res.unshift({ type: 'Mechanical', quantity: 2, hours: Math.max(dur, 6) });
      res = res.map(r => ((r.type || '').toLowerCase() === 'mechanical' && (r.hours || 0) < 4) ? { ...r, hours: Math.max(dur, 6), quantity: Math.max(r.quantity || 1, 2) } : r);
      if (!hasType('Electrical')) res.push({ type: 'Electrical', quantity: 1, hours: 2 }); // isolation
      if (isHeavy && !hasType('Rigger')) res.push({ type: 'Rigger', quantity: 1, hours: 3 });
      if (isHeavy && !hasType('Helper')) res.push({ type: 'Helper', quantity: 1, hours: Math.max(dur, 4) });
    } else if (cat === 'ELECTRICAL') {
      if (!hasType('Electrical')) res.unshift({ type: 'Electrical', quantity: 2, hours: Math.max(dur, 4) });
      res = res.map(r => ((r.type || '').toLowerCase() === 'electrical' && (r.hours || 0) < 3) ? { ...r, hours: Math.max(dur, 4), quantity: Math.max(r.quantity || 1, 2) } : r);
      if (!hasType('Helper')) res.push({ type: 'Helper', quantity: 1, hours: 2 });
    } else if (cat === 'INSTRUMENTATION') {
      if (!hasType('Instrumentation')) res.unshift({ type: 'Instrumentation', quantity: 1, hours: Math.max(dur, 3) });
      if (!hasType('Electrical') && /plc|dcs|panel|actuador|valve/i.test(dl)) res.push({ type: 'Electrical', quantity: 1, hours: 1.5 });
    } else if (cat === 'STRUCTURAL') {
      if (!hasType('Mechanical')) res.unshift({ type: 'Mechanical', quantity: 2, hours: Math.max(dur, 6) });
      if (!hasType('Welder') && /crack|soldadura|weld|corrosion/i.test(dl)) res.push({ type: 'Welder', quantity: 1, hours: 4 });
      if (!hasType('Rigger')) res.push({ type: 'Rigger', quantity: 1, hours: 3 });
    } else {
      // Unknown category — add minimum crew based on description
      if (!hasType('Mechanical') && /vibra|bearing|rod|pump|compresor|leak|seal/i.test(dl)) res.unshift({ type: 'Mechanical', quantity: 2, hours: Math.max(dur, 6) });
      if (!hasType('Electrical') && /motor|panel|trip|voltage|circuit/i.test(dl)) res.unshift({ type: 'Electrical', quantity: 2, hours: Math.max(dur, 4) });
      if (res.length < 2 && !hasType('Electrical')) res.push({ type: 'Electrical', quantity: 1, hours: 2 });
    }

    setF('resources', res);
    // Adjust duration to critical path
    const maxHrs = Math.max(...res.map(r => r.hours || 0), dur);
    if (maxHrs > dur) setF('estimatedDuration', String(maxHrs));

    // Materials — only add what makes sense for the category
    let mats = [...(aiMaterials || [])];
    const hasMat = (kw) => mats.some(m => (m.description || '').toLowerCase().includes(kw));
    if (cat === 'MECHANICAL' || cat === 'HYDRAULIC') {
      if (!hasMat('sello') && !hasMat('seal')) mats.push({ sapId: '10002001', description: 'Kit sellos mecanicos', quantity: 1, unit: 'UD' });
      if (!hasMat('empaquetadura') && !hasMat('gasket') && !hasMat('junta')) mats.push({ sapId: '10002050', description: 'Empaquetadura / junta', quantity: 2, unit: 'UD' });
      if (!hasMat('perno') && !hasMat('bolt')) mats.push({ sapId: '10005015', description: 'Pernos fijacion M12x40', quantity: 8, unit: 'UD' });
      if (!hasMat('grasa') && !hasMat('lubricant') && !hasMat('aceite') && !hasMat('grease')) mats.push({ sapId: '10004010', description: 'Grasa lubricante NLGI 2', quantity: 2, unit: 'KG' });
    } else if (cat === 'ELECTRICAL') {
      if (!hasMat('cable') && !hasMat('conductor')) mats.push({ sapId: '10007001', description: 'Cable conductor 3x2.5mm', quantity: 10, unit: 'MT' });
      if (!hasMat('fusible') && !hasMat('fuse')) mats.push({ sapId: '10007010', description: 'Fusibles proteccion', quantity: 3, unit: 'UD' });
      if (!hasMat('cinta') && !hasMat('tape')) mats.push({ sapId: '10007020', description: 'Cinta aislante electrica', quantity: 2, unit: 'UD' });
    } else if (cat === 'INSTRUMENTATION') {
      if (!hasMat('calibra') && !hasMat('sensor') && !hasMat('transducer')) mats.push({ sapId: '10008001', description: 'Sensor/transductor repuesto', quantity: 1, unit: 'UD' });
    }
    // Always add fasteners if none present and job is not instrumentation-only
    if (cat !== 'INSTRUMENTATION' && !hasMat('perno') && !hasMat('bolt') && !hasMat('fastener')) {
      mats.push({ sapId: '10005015', description: 'Pernos fijacion M12x40', quantity: 8, unit: 'UD' });
    }
    setF('materials', mats);
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
        equipment_condition: form.equipmentCondition || '',
        suggested_action: form.suggestedAction || '',
        wo_title: form.woTitle || '',
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
      toast.success('Notification created: ' + wrId);
    } catch (err) {
      toast.error(err.message || 'Error creating notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setWizardStep(1);
    setForm({
      whatHappens: '', whereTag: '', technicalLocation: '', technicalLocationCode: '',
      woTitle: '', suggestedAction: '', estimatedDuration: '', priority: 'P3', activityClass: 'M001',
      equipmentCondition: 'operating', failureCategory: 'MECHANICAL', failureSymptom: '',
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
              <span className="text-sm font-bold text-amber-800">Possible Duplicates</span>
            </div>
            <button onClick={() => setDuplicates([])} className="text-amber-400 hover:text-amber-600 text-lg">&times;</button>
          </div>
          <p className="text-xs text-amber-600 mt-1">{duplicates.length} similar notification(s) found</p>
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
                {d.created_at && <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString('en-US')}</span>}
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
              <h3 className="font-bold text-amber-900 text-lg">Existing Notification</h3>
              <span className="text-xs font-mono text-amber-600">{d.request_id || d.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowDuplicateDetail(null); setDuplicates([]); if (onNavigateTab) onNavigateTab('identification', d.request_id || d.id); }}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Go to Notification
              </button>
              <button onClick={() => setShowDuplicateDetail(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Status cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Status</span>
                <span className={`text-sm font-bold ${d.status === 'VALIDATED' ? 'text-green-700' : d.status === 'PENDING_VALIDATION' ? 'text-yellow-700' : 'text-gray-700'}`}>{d.status}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Priority</span>
                <span className={`text-sm font-bold ${['P1','P2'].includes(d.priority) ? 'text-red-600' : 'text-orange-600'}`}>{d.priority || '-'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Equipment</span>
                <span className="text-sm font-bold font-mono">{d.equipment_tag || '-'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Similarity</span>
                <span className="text-sm font-bold text-amber-600">{Math.round((d.similarity || 0) * 100)}%</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Failure Description</span>
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
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Failure Catalog</span>
                <div className="grid grid-cols-3 gap-2">
                  {failureMode && <div className="bg-blue-50 rounded-lg p-2 text-center"><span className="text-[10px] text-blue-500 block">Category</span><span className="text-xs font-bold text-blue-700">{failureMode}</span></div>}
                  {failureSymptom && <div className="bg-yellow-50 rounded-lg p-2 text-center"><span className="text-[10px] text-yellow-600 block">Symptom</span><span className="text-xs font-bold text-yellow-700">{failureSymptom}</span></div>}
                  {failureCause && <div className="bg-red-50 rounded-lg p-2 text-center"><span className="text-[10px] text-red-500 block">Cause</span><span className="text-xs font-bold text-red-700">{failureCause}</span></div>}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Resources</span>
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
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Materials</span>
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
                Created: {d.created_at ? new Date(d.created_at).toLocaleString('en-US') : '-'}
              </span>
              <button onClick={() => { setShowDuplicateDetail(null); setDuplicates([]); if (onNavigateTab) onNavigateTab('identification', d.request_id || d.id); }}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Go to Existing Notification
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Notification Created</h3>
          <p className="text-sm text-gray-500 mb-4">Your notification has been submitted for review</p>
          <div className="inline-block px-4 py-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 mb-6">
            <div className="text-xs text-emerald-600 font-medium">Notification ID</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{createdWRId}</div>
            <button onClick={() => { navigator.clipboard.writeText(createdWRId); }}
              className="mt-1 text-xs text-emerald-500 hover:text-emerald-700 flex items-center gap-1 mx-auto">
              <ClipboardCopy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { handleReset(); }} className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Create Another
            </button>
            <button onClick={() => { setCreatedWRId(null); if (onNavigateTab) onNavigateTab('identification'); }} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
              View Notifications
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
              <h2 className="text-lg font-bold text-gray-900">Create Work Notification</h2>
              <p className="text-xs text-gray-500 mt-0.5">Failure Notification / Work Request</p>
            </div>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              Will create Notification (WR)
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
              { step: 1, label: 'Location', icon: '📍', desc: 'Where it happened' },
              { step: 2, label: 'Failure', icon: '⚠️', desc: 'What happened' },
              { step: 3, label: 'Action', icon: '🔧', desc: 'What to do' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center flex-1">
                <button onClick={() => setWizardStep(s.step)} style={{minHeight: '60px'}}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all w-full ${
                    wizardStep === s.step
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : wizardStep > s.step
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                  <span className="text-lg">{s.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold">Step {s.step}: {s.label}</div>
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
          {/* 0. WO Title - auto-generated by AI */}
          <div className="border rounded-xl p-4 bg-emerald-50/30">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">WO TITLE / CASE NAME</label>
            <input
              type="text"
              value={form.woTitle}
              onChange={e => setF('woTitle', e.target.value)}
              placeholder="Auto-generated by AI Assist (e.g. 'Pump bearing replacement P-3201A')"
              className="w-full px-3 py-2.5 border border-emerald-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            />
            <p className="text-[10px] text-gray-400 mt-1">This will be the Work Order name in Planning and Identification</p>
          </div>

          {/* 1. What happened? + Voice / Camera */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What happened?</label>
              <div className="flex gap-2">
                {true ? (
                  <button type="button" onClick={handleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${isRecording ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? 'Grabando… click para detener' : 'Voice'}
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
              placeholder="Describe the problem, failure or work request..."
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
                  <>{photos.length > 0 ? '📸 Analyze Photo with AI' : '✨ AI Assist'}</>
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
                  ✓ Fields auto-filled by AI
                </span>
              )}
            </div>
            {/* Photo strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={photo} alt={`Photo ${i+1}`} className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200" />
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
                <span className="text-xs font-semibold text-violet-700">AI analyzing image...</span>
              </div>
            )}
            {/* SF-215: AI Vision Analysis Confirmation Card */}
            {visionResult && !visionLoading && (
              <div className="mt-3 border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-violet-800">AI Vision Analysis</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-200 text-violet-700 rounded-full font-semibold">
                      {Math.round((visionResult.confidence || 0.85) * 100)}% confidence
                    </span>
                  </div>
                  <button onClick={dismissVisionResult} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-3 p-2.5 bg-white rounded-lg border border-violet-200">
                  <div className="text-xs text-gray-500 font-semibold mb-1">Equipment Identified</div>
                  <div className="text-sm font-bold text-gray-800">{visionResult.equipment_identified}</div>
                  <div className="text-xs text-gray-500 mt-0.5 italic">Is this correct? Accept or modify below.</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white rounded-lg border border-violet-200">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Failure Type</div>
                    <div className="text-xs font-bold" style={{color:
                      visionResult.failure_type === 'MECHANICAL' ? '#6366F1' :
                      visionResult.failure_type === 'ELECTRICAL' ? '#F59E0B' :
                      visionResult.failure_type === 'HYDRAULIC' ? '#EF4444' :
                      visionResult.failure_type === 'STRUCTURAL' ? '#8B5CF6' : '#06B6D4'
                    }}>{visionResult.failure_type || 'N/A'}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-violet-200">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Severity</div>
                    <div className={`text-xs font-bold ${
                      visionResult.severity === 'critical' ? 'text-red-600' :
                      visionResult.severity === 'high' ? 'text-orange-600' :
                      visionResult.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {(visionResult.severity || 'medium').toUpperCase()}
                      {visionResult.severity === 'critical' ? ' (P1)' :
                       visionResult.severity === 'high' ? ' (P2)' :
                       visionResult.severity === 'medium' ? ' (P3)' : ' (P4)'}
                    </div>
                  </div>
                </div>
                {visionResult.description && (
                  <div className="mb-3 p-2 bg-white rounded-lg border border-violet-200">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">AI Description</div>
                    <div className="text-xs text-gray-700">{visionResult.description}</div>
                  </div>
                )}
                {visionResult.suggested_action && (
                  <div className="mb-3 p-2 bg-white rounded-lg border border-violet-200">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Suggested Action</div>
                    <div className="text-xs text-gray-700">{visionResult.suggested_action}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={acceptVisionSuggestions}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accept & Pre-fill Form
                  </button>
                  <button onClick={dismissVisionResult}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-all border border-gray-300">
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Suggested Action */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Suggested Actions</label>
            {/* Jorge (2026-04-20 tarde): las acciones sugeridas por la IA
                tienen que ser editables inline — X para borrar, ↑↓ para
                reordenar, + para agregar, texto editable. Re-serializa
                como "1. ... 2. ..." en suggestedAction al cambiar. */}
            {form.suggestedAction && /\d{1,2}[\.\)]\s/.test(form.suggestedAction) ? (() => {
              const parseSteps = (raw) => {
                const steps = [];
                for (let n = 1; n <= 30; n++) {
                  const start = raw.indexOf(`${n}. `);
                  if (start === -1) break;
                  const nextStart = raw.indexOf(`${n + 1}. `, start + 1);
                  const text = raw.substring(start, nextStart > -1 ? nextStart : undefined).replace(/^\d+\.\s*/, '').trim();
                  if (text) steps.push(text);
                }
                return steps;
              };
              const serialize = (arr) => arr.map((t, i) => `${i + 1}. ${t}`).join('\n');
              const steps = parseSteps(form.suggestedAction);
              return (
                <>
                  <div className="space-y-1.5 mb-2">
                    {steps.map((s, i) => (
                      <div key={i} className="flex gap-2 items-start p-2 bg-gray-50 rounded-lg border text-xs group">
                        <span className="font-bold text-emerald-600 min-w-[20px] pt-1">{i + 1}.</span>
                        <input
                          value={s}
                          onChange={(e) => {
                            const n = [...steps]; n[i] = e.target.value;
                            setF('suggestedAction', serialize(n));
                          }}
                          className="flex-1 bg-transparent border-b border-transparent focus:border-emerald-400 focus:outline-none py-1" />
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                          <button type="button" title="Subir" disabled={i === 0}
                            onClick={() => {
                              if (i === 0) return;
                              const n = [...steps]; [n[i - 1], n[i]] = [n[i], n[i - 1]];
                              setF('suggestedAction', serialize(n));
                            }}
                            className="p-0.5 text-gray-500 hover:text-emerald-700 disabled:opacity-30">↑</button>
                          <button type="button" title="Bajar" disabled={i === steps.length - 1}
                            onClick={() => {
                              if (i === steps.length - 1) return;
                              const n = [...steps]; [n[i + 1], n[i]] = [n[i], n[i + 1]];
                              setF('suggestedAction', serialize(n));
                            }}
                            className="p-0.5 text-gray-500 hover:text-emerald-700 disabled:opacity-30">↓</button>
                          <button type="button" title="Eliminar"
                            onClick={() => {
                              const n = steps.filter((_, j) => j !== i);
                              setF('suggestedAction', serialize(n));
                            }}
                            className="p-0.5 text-gray-400 hover:text-red-500">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => {
                        const txt = window.prompt('Nueva acción:');
                        if (!txt || !txt.trim()) return;
                        setF('suggestedAction', serialize([...steps, txt.trim()]));
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                      + Agregar acción
                    </button>
                    <button type="button" onClick={() => { const el = document.getElementById('sa-raw'); el.style.display = el.style.display === 'none' ? '' : 'none'; }}
                      className="text-[10px] text-blue-500 underline">Edit raw text</button>
                  </div>
                  <textarea id="sa-raw" style={{ display: 'none' }} value={form.suggestedAction} onChange={e => setF('suggestedAction', e.target.value)}
                    rows={3} className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
                </>
              );
            })() : (
              <textarea value={form.suggestedAction} onChange={e => setF('suggestedAction', e.target.value)}
                placeholder="What corrective action is recommended?"
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
            )}
          </div>

          {/* 3. Equipment Condition + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Required Equipment Condition</label>
              <div className="grid grid-cols-2 gap-2">
                {PLANT_CONDITIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setF('equipmentCondition', opt.value)}
                    className="p-2.5 rounded-xl border-2 transition-all text-sm font-bold"
                    style={{
                      borderColor: form.equipmentCondition === opt.value ? opt.color : '#e5e7eb',
                      backgroundColor: form.equipmentCondition === opt.value ? opt.color + '15' : 'transparent',
                      color: form.equipmentCondition === opt.value ? opt.color : '#64748B',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Priority</label>
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
          {/* 3b. Technical Location */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Technical Location *
            </label>
            {!plant ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Seleccioná una <b>planta</b> en el header antes de cargar el aviso.</span>
              </div>
            ) : !selectedLoc ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={locSearch}
                  onChange={e => { setLocSearch(e.target.value); setShowLocSearch(true); }}
                  onFocus={() => setShowLocSearch(true)} onBlur={() => setTimeout(() => setShowLocSearch(false), 200)}
                  placeholder="Search technical location..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                {showLocSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {locResults.map((node, i) => (
                      <button key={node.node_id || i} onClick={() => selectLocation(node)} className="w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{node.node_type}</span>
                          <span className="text-sm font-bold text-gray-900">{node.name || node._funcLoc}</span>
                        </div>
                        <div className="text-xs text-gray-400 pl-14">{node._funcLoc}</div>
                      </button>
                    ))}
                    <button type="button" onClick={openBrowseModal}
                      className="w-full text-center text-xs text-emerald-600 hover:text-emerald-700 font-semibold py-2.5 hover:bg-emerald-50 transition-colors border-t border-dashed border-emerald-200">
                      Browse All Locations...
                    </button>
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
                <CheckCircle className="w-3 h-3" /> Ubicacion auto-detectada desde {selectedEquip?.name || form.whereTag}
              </div>
            )}
          </div>

          {/* 3c. Grupo de Planning + Work Center */}
          {(form.planningGroup || form.workCenter) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-xl p-3 bg-blue-50 border-blue-200">
                <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Grupo de Planning</div>
                <select value={form.planningGroup} onChange={e => setF('planningGroup', e.target.value)}
                  className="w-full text-sm font-semibold text-blue-800 bg-transparent border-none focus:outline-none cursor-pointer">
                  <option value="">-- Select --</option>
                  {PLANNING_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="border rounded-xl p-3 bg-blue-50 border-blue-200">
                <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Work Center</div>
                <select value={form.workCenter} onChange={e => setF('workCenter', e.target.value)}
                  className="w-full text-sm font-semibold text-blue-800 bg-transparent border-none focus:outline-none cursor-pointer">
                  <option value="">-- Select --</option>
                  {WORK_CENTERS.filter(wc => !form.planningGroup || wc.area === form.planningGroup).map(wc => <option key={wc.value} value={wc.value}>{wc.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 3d. Equipo / TAG */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Equipo / TAG</label>
            {!plant ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Bloqueado — seleccioná planta primero.</span>
              </div>
            ) : !selectedLoc ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Bloqueado — elegí <b>Technical Location</b> primero para filtrar equipos.</span>
              </div>
            ) : !selectedEquip ? (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={equipSearch}
                    onChange={e => { setEquipSearch(e.target.value); setShowEquipSearch(true); }}
                    onFocus={() => {
                      setShowEquipSearch(true);
                      if (equipSearch.length < 2) {
                        const locCode = (selectedLoc?.code || '').toUpperCase();
                        const filtered = locCode ? allEquipment.filter(n => (n.code || '').toUpperCase().startsWith(locCode)) : allEquipment;
                        setEquipResults(filtered.slice(0, 20));
                      }
                    }} onBlur={() => setTimeout(() => setShowEquipSearch(false), 400)}
                    placeholder="Search by TAG, code or equipment name..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                {showEquipSearch && equipResults.length === 0 && selectedLoc && equipSearch.length < 2 && (
                  <div className="mt-1 p-3 text-xs text-center rounded-lg bg-gray-50 text-gray-500 border border-gray-200">
                    No equipment found under {selectedLoc.name || selectedLoc.code}
                  </div>
                )}
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
                        <div className="text-sm font-bold text-gray-900">{node.name || node.tag || node.code}</div>
                        <div className="text-xs text-gray-500">{node.tag && !/^\d{8,}$/.test(node.tag) ? node.tag : node.code || node.tag}</div>
                      </button>
                    ))}
                    <button type="button" onClick={openBrowseModal}
                      className="w-full text-center text-xs text-emerald-600 hover:text-emerald-700 font-semibold py-2.5 hover:bg-emerald-50 transition-colors border-t border-dashed border-emerald-200">
                      Browse All Locations...
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500">
                <div>
                  <div className="text-sm font-bold text-emerald-700">{selectedEquip.name || form.whereTag}</div>
                  <div className="text-xs text-emerald-600">{!/^\d{8,}$/.test(form.whereTag) ? form.whereTag : (selectedEquip.code || form.whereTag)}</div>
                </div>
                <button onClick={() => { setSelectedEquip(null); setF('whereTag', ''); clearLocation(); }}>
                  <X className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            )}
          </div>

          </div>
          <div style={{display: wizardStep === 2 ? undefined : "none"}}>
          {/* 5. Failure Catalog */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Failure Catalog</label>
            </div>
            <div className="flex gap-1 mb-3 p-1 rounded-lg bg-gray-100">
              {Object.entries(FAILURE_CATALOG).map(([key, cat]) => (
                <button key={key} onClick={() => { setF('failureCategory', key); setF('failureSymptom', ''); setF('failureObjectPart', ''); setF('failureCause', ''); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${form.failureCategory === key ? 'bg-white shadow-sm' : ''}`}
                  style={{ color: form.failureCategory === key ? cat.color : '#94a3b8' }}>{cat.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Object Part */}
              <div className="relative">
                <div className="text-xs font-medium text-gray-600 mb-1">Object Part</div>
                <button onClick={() => { setShowParts(!showParts); setShowSymptoms(false); setShowCauses(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                  style={{ borderColor: form.failureObjectPart ? FAILURE_CATALOG[form.failureCategory]?.color || '#e5e7eb' : '#e5e7eb' }}>
                  <span className={form.failureObjectPart ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureObjectPart || 'Select...'}</span>
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
              {/* Symptom */}
              <div className="relative">
                <div className="text-xs font-medium text-gray-600 mb-1">Symptom</div>
                <button onClick={() => { setShowSymptoms(!showSymptoms); setShowParts(false); setShowCauses(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                  style={{ borderColor: form.failureSymptom ? FAILURE_CATALOG[form.failureCategory]?.color || '#e5e7eb' : '#e5e7eb' }}>
                  <span className={form.failureSymptom ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureSymptom || 'Select...'}</span>
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
              {/* Cause */}
              <div className="relative">
                <div className="text-xs font-medium text-gray-600 mb-1">Cause</div>
                <button onClick={() => { setShowCauses(!showCauses); setShowSymptoms(false); setShowParts(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                  style={{ borderColor: form.failureCause ? FAILURE_CATALOG[form.failureCategory]?.color || '#e5e7eb' : '#e5e7eb' }}>
                  <span className={form.failureCause ? 'text-gray-900 font-medium' : 'text-gray-400'}>{form.failureCause || 'Select...'}</span>
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
          {/* 8. Labour */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Labour</label>
              <div className="flex gap-2">
                <button onClick={addResource} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                  + Add labour
                </button>
                {/* EXT button moved to Planning OT */}
              </div>
            </div>
            {form.resources.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Type</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Qty</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Duration (Hrs.)</div>
              </div>
            ) : (
              <div className="space-y-2">
                {form.resources.map((res, i) => (
                  <div key={i} className={"grid grid-cols-3 gap-2 p-2 rounded-lg " + (res.isExternal ? "bg-purple-50/50 border border-purple-200" : "bg-gray-50")}>
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
                          {res.type && res.type.trim() && !RESOURCE_TYPES.some(rt => rt.toLowerCase() === res.type.toLowerCase()) && (
                            <button onClick={() => {
                              setExtResIdx(i);
                              setExtResForm(prev => ({ ...prev, specialty: res.type.trim() }));
                              setShowExtResModal(true);
                              setActiveResTypeIdx(-1);
                            }} className="w-full text-left px-3 py-2.5 text-xs hover:bg-purple-50 border-t-2 border-purple-200 bg-purple-50/50 text-purple-700 font-semibold">
                              <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[10px] mr-1">EXT</span>
                              External Contract: "{res.type.trim()}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="Cant" value={res.quantity} onChange={e => updateResource(i, 'quantity', e.target.value)}
                        className="w-full p-2 pr-16 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">people</span>
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
              <Clock className="w-3.5 h-3.5" /> Estimated Duration (hours)
            </label>
            <input type="text" value={form.estimatedDuration} onChange={e => setF('estimatedDuration', e.target.value)}
              placeholder="e.g. 4 (hours)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>

          {/* 10. Materials */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Spare Parts and Materials</label>
              </div>
              <div className="flex gap-2">
                <button onClick={addMaterial} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                  + Add
                </button>

              </div>
            </div>
            {form.materials.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Material Code</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Qty</div>
                <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">Description</div>
              </div>
            ) : (
              <div className="space-y-2">
                {form.materials.map((mat, i) => (
                  <div key={i} className={"grid grid-cols-3 gap-2 p-2 rounded-lg " + (mat.isExternal ? "bg-purple-50/50 border border-purple-200" : "bg-gray-50")}>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      <input type="text" placeholder="Buscar material..." value={mat.sapId}
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
                          {mat.sapId && mat.sapId.trim() && !COMMON_MATERIALS.some(m => m.sapId === mat.sapId || m.desc.toLowerCase() === mat.sapId.toLowerCase()) && (
                            <button onClick={() => {
                              setExtMatIdx(i);
                              setExtMatForm(prev => ({ ...prev, description: mat.sapId }));
                              setShowExtMatModal(true);
                              setActiveMatSapIdx(-1);
                            }} className="w-full text-left px-3 py-2.5 text-xs hover:bg-purple-50 border-t-2 border-purple-200 bg-purple-50/50 text-purple-700 font-semibold">
                              <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[10px] mr-1">EXT</span>
                              Direct Purchase: "{mat.sapId.trim()}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <input type="number" min="0" placeholder="Cant" value={mat.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                        className="w-14 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <input type="text" value={mat.unit || 'UD'} readOnly
                        className="flex-1 p-1 rounded-lg border border-gray-100 text-xs bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div className="flex gap-1">
                      <input type="text" placeholder="Description" value={mat.description} readOnly={!!mat.sapId && !!mat.description}
                        onChange={e => !mat.sapId ? updateMaterial(i, 'description', e.target.value) : null}
                        className={"flex-1 p-2 rounded-lg border text-xs " + (mat.sapId && mat.description ? "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed" : "border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30")} />
                      <button onClick={() => removeMaterial(i)} className="px-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>




      {/* ═══ EXTERNAL RESOURCE / CONTRACT MODAL (SAP style) ═══ */}
      {showExtResModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowExtResModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">PM03</span>
                    External Resource Contract
                  </h3>
                  <p className="text-blue-200 text-xs mt-0.5">Framework Contract / External Workforce</p>
                </div>
                <button onClick={() => setShowExtResModal(false)} className="text-white/70 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Specialty / Service Type</label>
                <input value={extResForm.specialty} onChange={e => setExtResForm(p => ({...p, specialty: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  placeholder="e.g. Specialized Welder, Crane Operator..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Contractor / Vendor</label>
                  <select value={extResForm.vendor} onChange={e => setExtResForm(p => ({...p, vendor: e.target.value, vendor_other: e.target.value === 'OTHER' ? p.vendor_other : ''}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
                    <option value="">-- Select --</option>
                    <option value="GRUAS_NORTE">Gruas del Norte SpA</option>
                    <option value="SOLDADURAS_PRO">Soldaduras Profesionales Ltda</option>
                    <option value="SERVICIOS_IND">Servicios Industriales OCP</option>
                    <option value="MANTTO_EXTERNO">Mantenimiento Externo S.A.</option>
                    <option value="EQUIP_ESPECIAL">Equipos Especiales Ltda</option>
                    <option value="OTHER">Other...</option>
                  </select>
                  {extResForm.vendor === 'OTHER' && (
                    <input value={extResForm.vendor_other || ''} onChange={e => setExtResForm(p => ({...p, vendor_other: e.target.value}))}
                      className="w-full mt-1.5 border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 bg-indigo-50/30"
                      placeholder="Contractor name..." autoFocus />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Framework Contract</label>
                  <input value={extResForm.contract_ref} onChange={e => setExtResForm(p => ({...p, contract_ref: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    placeholder="e.g. CM-2026-0045" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Rate ($/hr)</label>
                  <input type="number" min="0" step="5" value={extResForm.rate_per_hour} onChange={e => setExtResForm(p => ({...p, rate_per_hour: e.target.value, estimated_cost: (parseFloat(e.target.value)||0) * (parseFloat(p.estimated_hours)||0)}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="75" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Est. Hours</label>
                  <input type="number" min="0" step="0.5" value={extResForm.estimated_hours} onChange={e => setExtResForm(p => ({...p, estimated_hours: e.target.value, estimated_cost: (parseFloat(p.rate_per_hour)||0) * (parseFloat(e.target.value)||0)}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="8" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Total Cost</label>
                  <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700">
                    ${Number(extResForm.estimated_cost || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Notes</label>
                <textarea rows={2} value={extResForm.notes} onChange={e => setExtResForm(p => ({...p, notes: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  placeholder="Certifications required, shift schedule, safety briefing..." />
              </div>

              {extResForm.estimated_cost > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs text-indigo-600">
                    <div className="font-semibold uppercase">Contract Cost</div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">
                      {extResForm.vendor === 'OTHER' ? (extResForm.vendor_other || 'TBD') : (extResForm.vendor || 'TBD')}
                      {extResForm.contract_ref ? ' / ' + extResForm.contract_ref : ''}
                      {' / '}{extResForm.rate_per_hour || '?'}$/hr x {extResForm.estimated_hours || '?'}h
                    </div>
                  </div>
                  <div className="text-lg font-bold text-indigo-800">${Number(extResForm.estimated_cost || 0).toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-3 rounded-b-2xl bg-gray-50 flex items-center justify-between">
              <button onClick={() => setShowExtResModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => {
                const vendorName = extResForm.vendor === 'OTHER' ? (extResForm.vendor_other || '') : (extResForm.vendor || '');
                const typeName = '[EXT] ' + extResForm.specialty + (vendorName ? ' (' + vendorName + ')' : '');
                const hours = extResForm.estimated_hours || '0';
                const qty = '1';

                if (extResIdx >= 0 && extResIdx < form.resources.length) {
                  const updated = [...form.resources];
                  updated[extResIdx] = { type: typeName, quantity: qty, hours: hours, isExternal: true, extDetails: { ...extResForm, vendor: vendorName } };
                  setF('resources', updated);
                } else {
                  setF('resources', [...form.resources, { type: typeName, quantity: qty, hours: hours, isExternal: true, extDetails: { ...extResForm, vendor: vendorName } }]);
                }

                setExtResForm({ specialty: '', vendor: '', vendor_other: '', contract_ref: '', rate_per_hour: '', estimated_hours: '', estimated_cost: '', notes: '' });
                setShowExtResModal(false);
              }}
                disabled={!extResForm.specialty}
                className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Add External Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXTERNAL MATERIAL / DIRECT PURCHASE MODAL (SAP ME51N style) ═══ */}
      {showExtMatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowExtMatModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">ME51N</span>
                    Direct Purchase Request
                  </h3>
                  <p className="text-amber-100 text-xs mt-0.5">Material not in catalog - Purchase Requisition</p>
                </div>
                <button onClick={() => setShowExtMatModal(false)} className="text-white/70 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Material Description</label>
                <input value={extMatForm.description} onChange={e => setExtMatForm(p => ({...p, description: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="e.g. Special bearing NSK 6308..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Vendor / Supplier</label>
                  <select value={extMatForm.vendor} onChange={e => setExtMatForm(p => ({...p, vendor: e.target.value, vendor_other: e.target.value === 'OTHER' ? p.vendor_other : ''}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
                    <option value="">-- Select --</option>
                    <option value="SKF">SKF</option>
                    <option value="NSK">NSK</option>
                    <option value="SIEMENS">Siemens</option>
                    <option value="ABB">ABB</option>
                    <option value="FLENDER">Flender</option>
                    <option value="GRUNDFOS">Grundfos</option>
                    <option value="FLOWSERVE">Flowserve</option>
                    <option value="JOHN_CRANE">John Crane</option>
                    <option value="FERRETERIA">Hardware Store</option>
                    <option value="OTHER">Other...</option>
                  </select>
                  {extMatForm.vendor === 'OTHER' && (
                    <input value={extMatForm.vendor_other || ''} onChange={e => setExtMatForm(p => ({...p, vendor_other: e.target.value}))}
                      className="w-full mt-1.5 border border-amber-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/30 bg-amber-50/30"
                      placeholder="Vendor name..." autoFocus />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Vendor Part Number</label>
                  <input value={extMatForm.part_number} onChange={e => setExtMatForm(p => ({...p, part_number: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    placeholder="e.g. 6308-2RS1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Estimated Unit Cost (USD)</label>
                  <input type="number" min="0" step="1" value={extMatForm.estimated_cost} onChange={e => setExtMatForm(p => ({...p, estimated_cost: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Lead Time (days)</label>
                  <input type="number" min="0" value={extMatForm.lead_time_days} onChange={e => setExtMatForm(p => ({...p, lead_time_days: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    placeholder="e.g. 5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Notes / Specifications</label>
                <textarea rows={2} value={extMatForm.notes} onChange={e => setExtMatForm(p => ({...p, notes: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/30 resize-none"
                  placeholder="Technical specs, tolerances, certifications required..." />
              </div>

              {extMatForm.estimated_cost && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs text-amber-600">
                    <div className="font-semibold uppercase">Purchase Impact</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">
                      {extMatForm.vendor === 'OTHER' ? (extMatForm.vendor_other || 'TBD') : (extMatForm.vendor || 'TBD')}
                      {extMatForm.part_number ? ' / ' + extMatForm.part_number : ''}
                      {extMatForm.lead_time_days ? ' / ' + extMatForm.lead_time_days + ' days' : ''}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-amber-800">${Number(extMatForm.estimated_cost || 0).toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-3 rounded-b-2xl bg-gray-50 flex items-center justify-between">
              <button onClick={() => setShowExtMatModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => {
                const vendorName = extMatForm.vendor === 'OTHER' ? (extMatForm.vendor_other || '') : (extMatForm.vendor || '');
                const sapId = '[EXT]' + (extMatForm.part_number ? ' ' + extMatForm.part_number : '');
                const desc = extMatForm.description + (vendorName ? ' (' + vendorName + ')' : '') + (extMatForm.estimated_cost ? ' ~$' + Number(extMatForm.estimated_cost).toLocaleString() : '');

                if (extMatIdx >= 0 && extMatIdx < form.materials.length) {
                  updateMaterial(extMatIdx, { sapId: sapId, description: desc, unit: form.materials[extMatIdx].unit || 'UD', quantity: form.materials[extMatIdx].quantity || '1', isExternal: true, extDetails: { ...extMatForm, vendor: vendorName } });
                } else {
                  setF('materials', [...form.materials, { sapId: sapId, description: desc, quantity: '1', unit: 'UD', isExternal: true, extDetails: { ...extMatForm, vendor: vendorName } }]);
                }

                setExtMatForm({ description: '', vendor: '', vendor_other: '', part_number: '', estimated_cost: '', lead_time_days: '', notes: '' });
                setShowExtMatModal(false);
              }}
                disabled={!extMatForm.description}
                className="px-5 py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Add Purchase Request
              </button>
            </div>
          </div>
        </div>
      )}

          {/* 11. Equipos Especiales */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Support Equipment</label>
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
                placeholder="Add support equipment..."
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
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">ME51N</span>
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
                  <select value={extForm.vendor} onChange={e => setExtForm(p => ({...p, vendor: e.target.value, vendor_other: e.target.value === 'OTHER' ? p.vendor_other : ''}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500">
                    <option value="">-- Select --</option>
                    <option value="GRUAS_NORTE">Gruas del Norte SpA</option>
                    <option value="SOLDADURAS_PRO">Soldaduras Profesionales Ltda</option>
                    <option value="SERVICIOS_IND">Servicios Industriales OCP</option>
                    <option value="MANTTO_EXTERNO">Mantenimiento Externo S.A.</option>
                    <option value="EQUIP_ESPECIAL">Equipos Especiales Ltda</option>
                    <option value="OTHER">Other...</option>
                  </select>
                  {extForm.vendor === 'OTHER' && (
                    <input value={extForm.vendor_other || ''} onChange={e => setExtForm(p => ({...p, vendor_other: e.target.value}))}
                      className="w-full mt-1.5 border border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 bg-purple-50/30"
                      placeholder="Vendor name..." autoFocus />
                  )}
                </div>

                {/* Specialty */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Specialty</label>
                  <select value={extForm.specialty} onChange={e => setExtForm(p => ({...p, specialty: e.target.value, specialty_other: e.target.value === 'OTRO' ? p.specialty_other : ''}))}
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
                    <option value="OTRO">Other...</option>
                  </select>
                  {extForm.specialty === 'OTRO' && (
                    <input value={extForm.specialty_other || ''} onChange={e => setExtForm(p => ({...p, specialty_other: e.target.value}))}
                      className="w-full mt-1.5 border border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 bg-purple-50/30"
                      placeholder="Specialty description..." autoFocus />
                  )}
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
                    <div className="text-[10px] text-purple-400 mt-0.5">{extForm.vendor === 'OTHER' ? (extForm.vendor_other || 'TBD') : (extForm.vendor || 'TBD')} · {extForm.specialty === 'OTRO' ? (extForm.specialty_other || 'TBD') : (extForm.specialty || 'TBD')} · {extForm.duration_days || '?'} days</div>
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
                const vendorName = extForm.vendor === 'OTHER' ? (extForm.vendor_other || 'Other') : (extForm.vendor || '');
                const specName = extForm.specialty === 'OTRO' ? (extForm.specialty_other || 'Other') : (extForm.specialty || '');
                const label = '[EXT] ' + extForm.service + (vendorName ? ' (' + vendorName + ')' : '') + (extForm.estimated_cost ? ' $' + Number(extForm.estimated_cost).toLocaleString() : '');
                setF('supportEquipment', [...(form.supportEquipment || []), label]);

                // Store external details in form for submission
                const extDetails = [...(form.externalServices || []), { ...extForm, vendor: vendorName, specialty: specName }];
                setF('externalServices', extDetails);

                setF('specialEquipment', '');
                setExtForm({ service: '', vendor: '', vendor_other: '', contract_ref: '', specialty: '', specialty_other: '', estimated_cost: '', duration_days: '', notes: '' });
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

          {/* 11b. Working Conditions / Environment */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Working Conditions / Environment</label>
            <textarea value={form.workConditions} onChange={e => setF('workConditions', e.target.value)}
              placeholder="Conditions required to execute the work (flat surface, clear area, disconnected equipment, etc.)"
              rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
            <div className="text-[10px] text-gray-400 mt-1">Pre-requisites and environmental conditions for the intervention</div>
          </div>

          {/* 12. Notificated by */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Notificated by
            </label>
            <input type="text" value={form.reportedBy} onChange={e => setF('reportedBy', e.target.value)}
              placeholder="Nombre del supervisor o reportante"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <div className="text-[10px] text-gray-400 mt-1">Notification author</div>
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

          {/* 15. Notification Class */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Notification Class
            </label>
            <div className="grid grid-cols-2 gap-2">
              {actClasses.map(ac => (
                <button key={ac.value} onClick={() => setF('activityClass', ac.value)}
                  className={`p-2.5 rounded-lg border-2 text-xs font-semibold text-center transition-all ${form.activityClass === ac.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {ac.value} - {ac.label}
                </button>
              ))}
            </div>
            {selectedPriority && (
              <p className="text-xs text-gray-500 mt-2">
                Auto-selected <strong>{form.activityClass === 'M002' ? 'M002 - Avería' : 'M001 - Maintenance Request'}</strong> based on priority {selectedPriority.value}
              </p>
            )}
          </div>

          {/* 16. Activity Class (Clase de Actividad) */}
          <div className="border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Activity Class
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'PM01', label: 'PM01 - Preventive/Request', desc: 'Scheduled or requested maintenance' },
                { value: 'PM03', label: 'PM03 - Corrective', desc: 'Breakdown / corrective repair' },
              ].map(ac => (
                <button key={ac.value} onClick={() => {/* read-only, set by priority */}}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${claseOT === ac.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 opacity-50'}`}>
                  <div className={`text-xs font-bold ${claseOT === ac.value ? 'text-emerald-700' : 'text-gray-500'}`}>{ac.value}</div>
                  <div className={`text-[10px] mt-0.5 ${claseOT === ac.value ? 'text-emerald-600' : 'text-gray-400'}`}>{ac.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Determined by priority: {selectedPriority?.value || '—'} → <strong>{claseOT}</strong>
            </p>
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
          <div className="flex items-center gap-3">
            {(!canSubmit || wizardStep !== 3) && (() => {
              const missing = [];
              if (!form.technicalLocationCode.trim()) missing.push('Ubicación / Equipo');
              if (!form.whatHappens.trim()) missing.push('¿Qué pasó?');
              if (wizardStep !== 3) missing.push(`completar Paso ${wizardStep + 1 <= 3 ? wizardStep + 1 : 3}`);
              return (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg max-w-[340px]">
                  ⚠ Falta: {missing.join(' · ')}
                </span>
              );
            })()}
            <button onClick={handleReset} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || !canSubmit || wizardStep !== 3}
              title={!canSubmit ? 'Completá los campos obligatorios antes de crear' : wizardStep !== 3 ? 'Avanzá hasta Paso 3' : ''}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                : <>Create Work Notification <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Browse All Locations Modal - Drill Down */}
      {showBrowseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBrowseModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Browse Locations</h3>
              <button onClick={() => setShowBrowseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Breadcrumb */}
            <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-1 text-sm flex-wrap">
              <button onClick={() => drillUp(-1)} className={"font-medium hover:underline " + (browsePath.length === 0 ? "text-emerald-700" : "text-blue-600")}>
                All Plants
              </button>
              {browsePath.map((p, i) => (
                <span key={p.node_id} className="flex items-center gap-1">
                  <span className="text-gray-400">/</span>
                  <button onClick={() => drillUp(i)} className={"font-medium hover:underline " + (i === browsePath.length - 1 ? "text-emerald-700" : "text-blue-600")}>
                    {p.name}
                  </button>
                </span>
              ))}
            </div>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={browseSearch} onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Filter..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
            </div>
            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {browseLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : browseResults.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <p className="text-sm text-gray-600 mb-1 font-medium">
                    Esta es la ubicación final
                  </p>
                  <p className="text-xs text-gray-500 mb-5">
                    Haz clic en el botón verde para confirmar la selección
                  </p>
                  {browsePath.length > 0 && (
                    <button onClick={() => {
                      const last = browsePath[browsePath.length - 1];
                      selectBrowseLocation({ node_id: last.node_id, name: last.name, node_type: last.node_type });
                    }} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-base font-bold hover:bg-emerald-700 shadow-lg animate-pulse">
                      ✓ Seleccionar: {browsePath[browsePath.length - 1]?.name}
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {browseResults.map((node, i) => {
                    const hasChildren = ['PLANT','AREA','SYSTEM','EQUIPMENT'].includes(node.node_type);
                    const typeColors = {
                      PLANT: 'bg-purple-100 text-purple-700',
                      AREA: 'bg-blue-100 text-blue-700',
                      SYSTEM: 'bg-cyan-100 text-cyan-700',
                      EQUIPMENT: 'bg-amber-100 text-amber-700',
                      SUB_ASSEMBLY: 'bg-orange-100 text-orange-700',
                      MAINTAINABLE_ITEM: 'bg-gray-100 text-gray-600',
                    };
                    return (
                      <div key={node.node_id || i} className="flex items-center px-4 py-3 hover:bg-gray-50 group">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => hasChildren ? drillDown(node) : selectBrowseLocation(node)}>
                          <div className="flex items-center gap-2">
                            <span className={"text-xs font-mono px-1.5 py-0.5 rounded " + (typeColors[node.node_type] || 'bg-gray-100 text-gray-600')}>
                              {node.node_type}
                            </span>
                            <span className="text-sm font-bold text-gray-900 truncate">{node.name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs font-mono text-gray-500">{node.sap_func_loc || node.code || ''}</span>
                            {node.tag && <span className="text-xs text-gray-400">TAG: {node.tag}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button onClick={() => selectBrowseLocation(node)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </button>
                          {hasChildren && (
                            <button onClick={() => drillDown(node)}
                              className="text-gray-400 hover:text-gray-600">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-3 border-t text-xs text-gray-500 flex justify-between items-center">
              <span>{browseResults.length} items</span>
              <button onClick={() => setShowBrowseModal(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
