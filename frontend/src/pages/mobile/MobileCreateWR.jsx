import { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Camera, Search, X, Clock, Wrench, Package, FileText, CheckCircle, ArrowLeft, MapPin, ChevronRight, AlertTriangle, ChevronDown } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const PLANT_CONDITIONS = [
    { value: 'operating', label: 'Operando', color: '#10B981' },
    { value: 'stopped', label: 'Detenida', color: '#EF4444' },
];

const PRIORITIES = [
    { value: 'P1', label: '1 - Urgente', sub: '< 24 horas', color: '#EF4444', bg: '#FEE2E2', claseOT: 'PM03', claseOTLabel: 'No Programado' },
    { value: 'P2', label: '2 - Programa en Ejecución', sub: '< 7 días', color: '#F97316', bg: '#FED7AA', claseOT: 'PM03', claseOTLabel: 'No Programado' },
    { value: 'P3', label: '3 - Próximo Programa', sub: '> 7 días', color: '#EAB308', bg: '#FEF3C7', claseOT: 'PM01', claseOTLabel: 'Scheduled' },
    { value: 'P4', label: '4 - Parada de Planta', sub: 'Parada programada', color: '#3B82F6', bg: '#DBEAFE', claseOT: 'PM01', claseOTLabel: 'Scheduled' },
];

// SAP PM: Clase Aviso → Clase OT → Clases de Actividad
const ACTIVITY_CLASSES = {
    PM01: [
        { value: 'CR', label: 'CR - Correctivo' },
        { value: 'MC', label: 'MC - Monitoreo Condición' },
        { value: 'MJ', label: 'MJ - Mejora' },
        { value: 'IO', label: 'IO - Incidente Operacional' },
    ],
    PM03: [
        { value: 'CR', label: 'CR - Correctivo' },
        { value: 'IP', label: 'IP - Imprevisto' },
        { value: 'IO', label: 'IO - Incidente Operacional' },
    ],
};

// Fallback failure catalog (used if API is unavailable)
const DEFAULT_FAILURE_CATALOG = {
    MECANICO: { label: 'Mecánico', color: '#6366F1', symptoms: [], parts: [], causes: [] },
    ELECTRICO: { label: 'Eléctrico', color: '#F59E0B', symptoms: [], parts: [], causes: [] },
    INSTRUMENTACION: { label: 'Instrumentación', color: '#06B6D4', symptoms: [], parts: [], causes: [] },
};

const RESOURCE_TYPES = [
    'Mecánico', 'Eléctrico', 'Instrumentista', 'Lubricador', 'Soldador',
    'Operador Grúa', 'Andamiero', 'Calderero', 'Ayudante General', 'Supervisor',
];

const COMMON_MATERIALS = [
    { sapId: '10001234', desc: 'Rodamiento SKF 6205' },
    { sapId: '10001235', desc: 'Sello mecánico' },
    { sapId: '10001236', desc: 'Correa V A-68' },
    { sapId: '10001237', desc: 'Aceite ISO 68' },
    { sapId: '10001238', desc: 'Grasa EP2' },
    { sapId: '10001239', desc: 'Filtro aceite hidráulico' },
    { sapId: '10001240', desc: 'Junta tórica NBR' },
    { sapId: '10001241', desc: 'Tornillo M12x50 Gr8.8' },
    { sapId: '10001242', desc: 'Electrodo E7018 3/32' },
    { sapId: '10001243', desc: 'Cable 3x10 AWG' },
    { sapId: '10001244', desc: 'Fusible NH 100A' },
    { sapId: '10001245', desc: 'Contactor 3P 40A' },
    { sapId: '10001246', desc: 'Sensor proximidad inductivo' },
    { sapId: '10001247', desc: 'Transmisor presión 0-10bar' },
    { sapId: '10001248', desc: 'Válvula solenoide 1/2"' },
];

const SPECIAL_EQUIPMENT = [
    'Grúa 20 Ton', 'Grúa 50 Ton', 'Grúa Horquilla', 'Andamio Multidireccional',
    'Andamio Tubular', 'Camión Pluma', 'Plataforma Elevadora', 'Soldadora MIG/MAG',
    'Soldadora TIG', 'Soldadora Arco', 'Compresor Portátil', 'Generador Eléctrico',
    'Bomba Sumergible', 'Hidrolavadora', 'Equipo Alineación Láser',
    'Analizador de Vibraciones', 'Cámara Termográfica', 'Megóhmetro',
    'Multímetro Industrial', 'Torquímetro', 'Extractor Hidráulico',
    'Gata Hidráulica', 'Tecle Cadena 5 Ton', 'Esmeril Angular',
    'Taladro Magnético', 'Equipo Ultrasonido', 'Detector de Gases',
];

export default function MobileCreateWR() {
    const { plant } = useOutletContext();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const cameraRef = useRef(null);
    const recognitionRef = useRef(null);
    const baseTextRef = useRef('');

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    // SAP PM Catalog data (loaded from API, extracted from Planillas de Carga)
    const [failureCatalog, setFailureCatalog] = useState(DEFAULT_FAILURE_CATALOG);
    const failureCategories = Object.keys(failureCatalog);

    // Equipment & location search
    const [equipSearch, setEquipSearch] = useState('');
    const [allNodes, setAllNodes] = useState([]);
    const [allEquipment, setAllEquipment] = useState([]);
    const [locationNodes, setLocationNodes] = useState([]);
    const [equipResults, setEquipResults] = useState([]);
    const [showEquipSearch, setShowEquipSearch] = useState(false);
    const [selectedEquip, setSelectedEquip] = useState(null);
    // Ubicación Técnica search
    const [locSearch, setLocSearch] = useState('');
    const [locResults, setLocResults] = useState([]);
    const [showLocSearch, setShowLocSearch] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState(null);

    // Failure catalog state
    const [failureCategory, setFailureCategory] = useState('MECANICO');
    const [showSymptoms, setShowSymptoms] = useState(false);
    const [showParts, setShowParts] = useState(false);
    const [showCauses, setShowCauses] = useState(false);
    // Searchable filters for failure catalog
    const [symptomFilter, setSymptomFilter] = useState('');
    const [partFilter, setPartFilter] = useState('');
    const [causeFilter, setCauseFilter] = useState('');
    // Resource type combobox
    const [activeResTypeIdx, setActiveResTypeIdx] = useState(-1);
    // Material SAP combobox
    const [activeMatSapIdx, setActiveMatSapIdx] = useState(-1);
    // Special equipment combobox
    const [showSpecEquip, setShowSpecEquip] = useState(false);

    const [form, setForm] = useState({
        whatHappens: '',
        whereTag: '',
        technicalLocation: '',
        technicalLocationCode: '',
        suggestedAction: '',
        resources: [],
        estimatedDuration: '',
        materials: [],
        specialEquipment: '',
        plantCondition: 'operating',
        priority: 'P3',
        activityClass: 'CR',
        photos: [],
        failureSymptom: '',
        failureObjectPart: '',
        failureCause: '',
        // SAP Aviso fields (IH01)
        reportedBy: '',          // Autor del Aviso (quién reporta, puede ser distinto del creador)
        circumstances: '',       // Detalle/Circunstancias del aviso
        supportEquipment: '',    // Equipos de apoyo necesarios
    });

    // Build parent path for a node using the node map
    const buildFuncLocPath = (node, nodeMap) => {
        if (node.sap_func_loc) return node.sap_func_loc;
        const parts = [];
        let current = node;
        while (current) {
            parts.unshift(current.code || current.tag || current.name);
            current = current.parent_node_id ? nodeMap[current.parent_node_id] : null;
        }
        return parts.join('-');
    };

    // Load all hierarchy nodes once (equipment + locations)
    useEffect(() => {
        api.listNodes({})
            .then(res => {
                const nodes = Array.isArray(res) ? res : res?.items || [];
                setAllNodes(nodes);
                const nodeMap = {};
                nodes.forEach(n => { nodeMap[n.node_id] = n; });
                setAllEquipment(nodes.filter(n => n.node_type === 'EQUIPMENT'));
                // Locations = everything except EQUIPMENT, SUB_ASSEMBLY, MAINTAINABLE_ITEM
                setLocationNodes(nodes.filter(n =>
                    ['PLANT', 'AREA', 'SYSTEM'].includes(n.node_type)
                ).map(n => ({ ...n, _funcLoc: buildFuncLocPath(n, nodeMap) })));
            })
            .catch(() => {});
    }, []);

    // Load SAP PM failure catalog from API (Planillas de Carga data)
    useEffect(() => {
        api.getFailureCategories()
            .then(categories => {
                if (Array.isArray(categories) && categories.length > 0) {
                    const catalog = {};
                    categories.forEach(cat => {
                        catalog[cat.category] = {
                            label: cat.label,
                            color: cat.color,
                            symptoms: cat.symptoms || [],
                            parts: cat.parts || [],
                            causes: cat.causes || [],
                        };
                    });
                    setFailureCatalog(catalog);
                }
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    // Filter equipment client-side
    useEffect(() => {
        if (equipSearch.length < 2) { setEquipResults([]); return; }
        const q = equipSearch.toLowerCase();
        const filtered = allEquipment.filter(n =>
            (n.tag || '').toLowerCase().includes(q) ||
            (n.code || '').toLowerCase().includes(q) ||
            (n.name || '').toLowerCase().includes(q)
        ).slice(0, 8);
        setEquipResults(filtered);
    }, [equipSearch, allEquipment]);

    // Filter locations client-side
    useEffect(() => {
        if (locSearch.length < 2) { setLocResults([]); return; }
        const q = locSearch.toLowerCase();
        const filtered = locationNodes.filter(n =>
            (n._funcLoc || '').toLowerCase().includes(q) ||
            (n.code || '').toLowerCase().includes(q) ||
            (n.name || '').toLowerCase().includes(q)
        ).slice(0, 8);
        setLocResults(filtered);
    }, [locSearch, locationNodes]);

    // Auto-detect equipment tag from description text
    useEffect(() => {
        if (selectedEquip || !form.whatHappens || allEquipment.length === 0) return;
        const text = form.whatHappens.toUpperCase();
        // 1) Try exact match with known tags from hierarchy
        const found = allEquipment.find(n => {
            const tag = (n.tag || n.code || '').toUpperCase();
            return tag && tag.length >= 4 && text.includes(tag);
        });
        if (found) {
            setSelectedEquip(found);
            set('whereTag', found.tag || found.code);
            return;
        }
        // 2) Try regex for common tag patterns (e.g., P-1201A, CV-304, BRY-SAG-ML-001)
        const tagMatch = form.whatHappens.match(/\b([A-Z]{1,5}(?:-[A-Z0-9]{1,6}){1,5})\b/i);
        if (tagMatch) {
            const extracted = tagMatch[1].toUpperCase();
            // Try to find partial match in equipment list
            const partial = allEquipment.find(n => {
                const tag = (n.tag || n.code || '').toUpperCase();
                return tag && (tag.includes(extracted) || extracted.includes(tag));
            });
            if (partial) {
                setSelectedEquip(partial);
                set('whereTag', partial.tag || partial.code);
            } else {
                // Use extracted tag as manual entry
                setSelectedEquip({ tag: extracted, name: 'Detectado del texto' });
                set('whereTag', extracted);
            }
        }
    }, [form.whatHappens, allEquipment, selectedEquip]);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const selectEquipment = (node) => {
        const tag = node.tag || node.code || node.name;
        setSelectedEquip(node);
        set('whereTag', tag);
        // Auto-resolve Ubicación Técnica from parent hierarchy
        if (node.parent_node_id) {
            const nodeMap = {};
            allNodes.forEach(n => { nodeMap[n.node_id] = n; });
            const parent = nodeMap[node.parent_node_id];
            if (parent) {
                const funcLoc = buildFuncLocPath(parent, nodeMap);
                setSelectedLoc(parent);
                set('technicalLocation', parent.name || funcLoc);
                set('technicalLocationCode', funcLoc);
            }
        }
        // Auto-detect failure category from equipment type/name
        const nameUpper = (node.name || '').toUpperCase();
        const tagUpper = tag.toUpperCase();
        const combined = nameUpper + ' ' + tagUpper;
        if (/SENSOR|TRANSMISOR|PLC|DCS|INSTRUMENT|VALVULA.CONTROL|MEDIDOR|ANALIZADOR/.test(combined)) {
            setFailureCategory('INSTRUMENTACION');
            set('failureSymptom', ''); set('failureObjectPart', ''); set('failureCause', '');
        } else if (/MOTOR.ELEC|TABLERO|TRANSFORM|CABLE|VARIADOR|MCC|INTERRUPTOR/.test(combined)) {
            setFailureCategory('ELECTRICO');
            set('failureSymptom', ''); set('failureObjectPart', ''); set('failureCause', '');
        }
        setEquipSearch('');
        setShowEquipSearch(false);
    };

    const clearEquipment = () => {
        setSelectedEquip(null);
        set('whereTag', '');
    };

    const selectLocation = (node) => {
        setSelectedLoc(node);
        set('technicalLocation', node.name || node._funcLoc);
        set('technicalLocationCode', node._funcLoc || node.code);
        setLocSearch('');
        setShowLocSearch(false);
    };

    const clearLocation = () => {
        setSelectedLoc(null);
        set('technicalLocation', '');
        set('technicalLocationCode', '');
    };

    // Voice recording
    const handleVoice = () => {
        if (!SpeechRecognition) {
            toast.error('Tu navegador no soporta reconocimiento de voz. Usa Chrome.');
            return;
        }
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
            set('whatHappens', (base + sep + finalTranscript + interim).trimEnd());
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => {
            setIsRecording(false);
            if (finalTranscript.trim()) {
                const base = baseTextRef.current;
                const sep = base ? '\n' : '';
                set('whatHappens', (base + sep + finalTranscript).trimEnd());
            }
        };
        recognition.start();
    };

    // Camera
    const handleCamera = () => cameraRef.current?.click();
    const handleCameraChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => set('photos', [...form.photos, ev.target.result]);
        reader.readAsDataURL(file);
    };
    const removePhoto = (idx) => set('photos', form.photos.filter((_, i) => i !== idx));

    // Materials
    const addMaterial = () => set('materials', [...form.materials, { quantity: '', sapId: '', description: '' }]);
    const updateMaterial = (idx, field, val) => {
        const mats = [...form.materials];
        mats[idx] = { ...mats[idx], [field]: val };
        set('materials', mats);
    };
    const removeMaterial = (idx) => set('materials', form.materials.filter((_, i) => i !== idx));

    // Resources (workforce)
    const addResource = () => set('resources', [...form.resources, { quantity: '', type: '', hours: '' }]);
    const updateResource = (idx, field, val) => {
        const res = [...form.resources];
        res[idx] = { ...res[idx], [field]: val };
        set('resources', res);
    };
    const removeResource = (idx) => set('resources', form.resources.filter((_, i) => i !== idx));

    // Submit
    const canSubmit = form.whatHappens && form.whereTag && form.suggestedAction && form.resources.length > 0 && form.estimatedDuration;

    const handleSubmit = async () => {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        try {
            const res = await api.createWRManual({
                equipment_tag: form.whereTag,
                equipment_name: form.whereTag,
                plant_id: plant,
                problem_description: form.whatHappens,
                priority: form.priority,
                activity_class: form.activityClass || '',
                failure_category: failureCategory || '',
                failure_symptom: form.failureSymptom || '',
                failure_cause: form.failureCause || '',
                plant_condition: form.plantCondition || '',
                suggested_action: form.suggestedAction || '',
                estimated_duration: parseFloat(form.estimatedDuration) || 4,
                materials: (form.materials || []).map(m => typeof m === 'string' ? m : m.name || '').filter(Boolean),
                resources: (form.resources || []).map(r => typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1}`).filter(Boolean),
                created_by: user?.user_id || user?.username || '',
                // SAP Aviso fields
                notification_type: 'A1',
                reported_by: form.reportedBy || '',
                circumstances: form.circumstances || '',
                support_equipment: form.supportEquipment ? form.supportEquipment.split(',').map(s => s.trim()).filter(Boolean) : [],
            });
            setSuccess(res);
            toast.success('Aviso creado exitosamente');

            // If photos exist, upload them separately via capture endpoint
            if (form.photos.length > 0) {
                try {
                    await api.submitCapture({
                        capture_type: 'IMAGE',
                        raw_text_input: form.whatHappens,
                        equipment_tag_manual: form.whereTag,
                        plant_id: plant,
                        image_data: form.photos[0],
                        technician_id: user?.user_id || 'UNKNOWN',
                        technician_name: user?.full_name || user?.username || 'Unknown',
                    });
                } catch { /* photo upload is best-effort */ }
            }
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setSubmitting(false);
    };

    const resetForm = () => {
        setForm({
            whatHappens: '', whereTag: '', technicalLocation: '', technicalLocationCode: '',
            suggestedAction: '', resources: [], estimatedDuration: '', materials: [],
            specialEquipment: '', plantCondition: 'operating', priority: 'P3', activityClass: 'CR', photos: [],
            failureSymptom: '', failureObjectPart: '', failureCause: '',
            reportedBy: '', circumstances: '', supportEquipment: '',
        });
        setSelectedEquip(null);
        setSelectedLoc(null);
        setFailureCategory('MECANICO');
        setSuccess(null);
    };

    // Success screen
    if (success) {
        const wrId = success.work_request_id || success.request_id || success.capture_id || '';
        return (
            <div className="p-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
                <div className="flex flex-col items-center justify-center pt-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ECFDF5' }}>
                        <CheckCircle className="w-10 h-10" style={{ color: '#047857' }} />
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#0F172A' }}>Aviso Creado</h2>
                    <p className="text-sm text-center mb-4" style={{ color: '#64748B' }}>
                        Tu aviso ha sido enviado para revisión
                    </p>
                    {wrId && (
                        <div className="px-5 py-3 rounded-2xl mb-6" style={{ backgroundColor: '#ECFDF5', border: '2px solid #10B981' }}>
                            <div className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>ID</div>
                            <div className="text-lg font-bold font-mono" style={{ color: '#047857' }}>{wrId.slice(0, 12)}</div>
                        </div>
                    )}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => navigate('/m/avisos')}
                            className="flex-1 py-3 rounded-2xl text-sm font-bold border-2"
                            style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
                        >
                            Ver WRs
                        </button>
                        <button
                            onClick={resetForm}
                            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
                            style={{ backgroundColor: '#047857' }}
                        >
                            Crear Otro
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F8FAFC' }}>
            {/* Hidden camera input */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleCameraChange} className="hidden" />

            {/* Header */}
            <div className="bg-white border-b p-4 sticky top-0 z-10" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft className="w-5 h-5" style={{ color: '#64748B' }} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: '#0F172A' }}>Crear Aviso</h1>
                        <p className="text-xs" style={{ color: '#64748B' }}>Documenta hallazgos y necesidades</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 pb-32">
                {/* Capture method */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        MÉTODO DE CAPTURA
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                            onClick={handleVoice}
                            className="rounded-xl p-4 border-2 transition-all active:scale-95"
                            style={{
                                borderColor: isRecording ? '#EF4444' : '#10B981',
                                backgroundColor: isRecording ? '#FEE2E2' : '#ECFDF5',
                            }}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: isRecording ? '#EF4444' : '#10B981' }}>
                                    {isRecording
                                        ? <Mic className="w-6 h-6 text-white animate-pulse" />
                                        : <MicOff className="w-6 h-6 text-white" />}
                                </div>
                                <div className="text-sm font-bold" style={{ color: '#0F172A' }}>
                                    {isRecording ? 'Grabando...' : 'Voz'}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleCamera}
                            className="rounded-xl p-4 border-2 transition-all active:scale-95"
                            style={{ borderColor: '#06B6D4', backgroundColor: '#CFFAFE' }}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#06B6D4' }}>
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Foto</div>
                            </div>
                        </button>
                    </div>

                    {/* Photo previews */}
                    {form.photos.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                            {form.photos.map((photo, i) => (
                                <div key={i} className="relative flex-shrink-0">
                                    <img src={photo} alt="" className="w-16 h-16 rounded-lg object-cover border" style={{ borderColor: '#E2E8F0' }} />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                        style={{ backgroundColor: '#EF4444' }}
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center text-xs font-medium mt-2" style={{ color: '#94A3B8' }}>
                        — O formulario manual —
                    </div>
                </div>

                {/* 1. ¿Qué ocurre? */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        ¿QUÉ OCURRE? *
                    </label>
                    <textarea
                        value={form.whatHappens}
                        onChange={(e) => set('whatHappens', e.target.value)}
                        placeholder="Describe el problema, anomalía o necesidad detectada..."
                        className="w-full h-24 p-3 rounded-xl border text-sm resize-none outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                    />
                </div>

                {/* 2. ¿Dónde? TAG equipo */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        ¿DÓNDE? (TAG EQUIPO) *
                    </label>
                    {!selectedEquip ? (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={equipSearch}
                                onChange={(e) => { setEquipSearch(e.target.value); setShowEquipSearch(true); }}
                                onFocus={() => equipSearch.length >= 2 && setShowEquipSearch(true)}
                                placeholder="Buscar por TAG (ej: P-1201A)..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                                style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                            />
                            {/* Manual entry fallback */}
                            {equipSearch.length >= 2 && equipResults.length === 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedEquip({ tag: equipSearch, name: `${equipSearch} (No catalogado)` });
                                        set('whereTag', equipSearch);
                                        setShowEquipSearch(false);
                                    }}
                                    className="w-full mt-2 p-2 text-xs text-left rounded-lg"
                                    style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                                >
                                    Usar "{equipSearch}" como TAG manual
                                </button>
                            )}
                            {/* Search results */}
                            {showEquipSearch && equipResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderColor: '#E2E8F0' }}>
                                    {equipResults.map((node, i) => (
                                        <button
                                            key={node.node_id || i}
                                            onClick={() => selectEquipment(node)}
                                            className="w-full text-left px-3 py-2.5 border-b last:border-b-0 active:bg-gray-50"
                                            style={{ borderColor: '#F1F5F9' }}
                                        >
                                            <div className="text-sm font-bold" style={{ color: '#0F172A' }}>{node.tag || node.code}</div>
                                            <div className="text-xs" style={{ color: '#64748B' }}>{node.name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#ECFDF5', border: '2px solid #10B981' }}>
                            <div>
                                <div className="text-sm font-bold" style={{ color: '#047857' }}>{form.whereTag}</div>
                                <div className="text-xs" style={{ color: '#064E3B' }}>{selectedEquip.name || ''}</div>
                            </div>
                            <button onClick={clearEquipment}>
                                <X className="w-5 h-5" style={{ color: '#047857' }} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Ubicación Técnica (SAP Functional Location) */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        UBICACIÓN TÉCNICA (SAP)
                    </label>
                    {!selectedLoc ? (
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={locSearch}
                                onChange={(e) => { setLocSearch(e.target.value); setShowLocSearch(true); }}
                                onFocus={() => locSearch.length >= 2 && setShowLocSearch(true)}
                                placeholder="Buscar ubicación (ej: MOL, Molienda)..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                                style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                            />
                            {showLocSearch && locResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderColor: '#E2E8F0' }}>
                                    {locResults.map((node, i) => (
                                        <button
                                            key={node.node_id || i}
                                            onClick={() => selectLocation(node)}
                                            className="w-full text-left px-3 py-2.5 border-b last:border-b-0 active:bg-gray-50"
                                            style={{ borderColor: '#F1F5F9' }}
                                        >
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                                                    {node.node_type}
                                                </span>
                                                <span className="text-sm font-bold" style={{ color: '#0F172A' }}>{node._funcLoc}</span>
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{node.name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#EFF6FF', border: '2px solid #3B82F6' }}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3B82F6' }} />
                                    <span className="text-sm font-bold font-mono truncate" style={{ color: '#1E40AF' }}>
                                        {form.technicalLocationCode}
                                    </span>
                                </div>
                                <div className="text-xs" style={{ color: '#3B82F6' }}>{form.technicalLocation}</div>
                            </div>
                            <button onClick={clearLocation} className="flex-shrink-0 ml-2">
                                <X className="w-5 h-5" style={{ color: '#3B82F6' }} />
                            </button>
                        </div>
                    )}
                    {selectedEquip && selectedLoc && (
                        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                            <ChevronRight className="w-3 h-3" />
                            Auto-detectada del equipo {form.whereTag}
                        </div>
                    )}
                </div>

                {/* CATÁLOGO DE FALLA (SAP PM) */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
                        <label className="text-xs font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                            CATÁLOGO DE FALLA
                        </label>
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ backgroundColor: '#F1F5F9' }}>
                        {failureCategories.map(cat => {
                            const active = failureCategory === cat;
                            const catData = failureCatalog[cat];
                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setFailureCategory(cat);
                                        // Clear selections when switching category
                                        set('failureSymptom', '');
                                        set('failureObjectPart', '');
                                        set('failureCause', '');
                                    }}
                                    className="flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        backgroundColor: active ? '#FFFFFF' : 'transparent',
                                        color: active ? catData.color : '#94A3B8',
                                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    {catData.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Síntoma selector — searchable */}
                    <div className="mb-3">
                        <div className="text-xs font-medium mb-1.5" style={{ color: '#475569' }}>Síntoma</div>
                        <button
                            onClick={() => { setShowSymptoms(!showSymptoms); setSymptomFilter(''); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border text-sm text-left"
                            style={{
                                borderColor: form.failureSymptom ? failureCatalog[failureCategory].color : '#E2E8F0',
                                backgroundColor: form.failureSymptom ? failureCatalog[failureCategory].color + '10' : '#F8FAFC',
                            }}
                        >
                            <span style={{ color: form.failureSymptom ? '#0F172A' : '#94A3B8' }}>
                                {form.failureSymptom || 'Seleccionar síntoma...'}
                            </span>
                            <ChevronDown className="w-4 h-4" style={{ color: '#94A3B8', transform: showSymptoms ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {showSymptoms && (
                            <div className="mt-1 border rounded-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                                <div className="sticky top-0 bg-white p-2 border-b" style={{ borderColor: '#F1F5F9' }}>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94A3B8' }} />
                                        <input
                                            type="text" value={symptomFilter}
                                            onChange={(e) => setSymptomFilter(e.target.value)}
                                            placeholder="Buscar síntoma..."
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none"
                                            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-36 overflow-y-auto">
                                    {failureCatalog[failureCategory].symptoms
                                        .filter(s => !symptomFilter || s.toLowerCase().includes(symptomFilter.toLowerCase()))
                                        .map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { set('failureSymptom', s); setShowSymptoms(false); setSymptomFilter(''); }}
                                                className="w-full text-left px-3 py-2 text-xs border-b last:border-b-0 active:bg-gray-50"
                                                style={{
                                                    borderColor: '#F1F5F9',
                                                    backgroundColor: form.failureSymptom === s ? failureCatalog[failureCategory].color + '15' : 'transparent',
                                                    fontWeight: form.failureSymptom === s ? 700 : 400,
                                                    color: form.failureSymptom === s ? failureCatalog[failureCategory].color : '#334155',
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))
                                    }
                                    {failureCatalog[failureCategory].symptoms.filter(s => !symptomFilter || s.toLowerCase().includes(symptomFilter.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-3 text-xs text-center" style={{ color: '#94A3B8' }}>Sin resultados</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Parte Objeto selector — searchable */}
                    <div className="mb-3">
                        <div className="text-xs font-medium mb-1.5" style={{ color: '#475569' }}>Parte Objeto</div>
                        <button
                            onClick={() => { setShowParts(!showParts); setPartFilter(''); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border text-sm text-left"
                            style={{
                                borderColor: form.failureObjectPart ? failureCatalog[failureCategory].color : '#E2E8F0',
                                backgroundColor: form.failureObjectPart ? failureCatalog[failureCategory].color + '10' : '#F8FAFC',
                            }}
                        >
                            <span style={{ color: form.failureObjectPart ? '#0F172A' : '#94A3B8' }}>
                                {form.failureObjectPart || 'Seleccionar parte...'}
                            </span>
                            <ChevronDown className="w-4 h-4" style={{ color: '#94A3B8', transform: showParts ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {showParts && (
                            <div className="mt-1 border rounded-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                                <div className="sticky top-0 bg-white p-2 border-b" style={{ borderColor: '#F1F5F9' }}>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94A3B8' }} />
                                        <input
                                            type="text" value={partFilter}
                                            onChange={(e) => setPartFilter(e.target.value)}
                                            placeholder="Buscar parte..."
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none"
                                            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-36 overflow-y-auto">
                                    {failureCatalog[failureCategory].parts
                                        .filter(p => !partFilter || p.toLowerCase().includes(partFilter.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { set('failureObjectPart', p); setShowParts(false); setPartFilter(''); }}
                                                className="w-full text-left px-3 py-2 text-xs border-b last:border-b-0 active:bg-gray-50"
                                                style={{
                                                    borderColor: '#F1F5F9',
                                                    backgroundColor: form.failureObjectPart === p ? failureCatalog[failureCategory].color + '15' : 'transparent',
                                                    fontWeight: form.failureObjectPart === p ? 700 : 400,
                                                    color: form.failureObjectPart === p ? failureCatalog[failureCategory].color : '#334155',
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))
                                    }
                                    {failureCatalog[failureCategory].parts.filter(p => !partFilter || p.toLowerCase().includes(partFilter.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-3 text-xs text-center" style={{ color: '#94A3B8' }}>Sin resultados</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Causa selector — searchable */}
                    <div>
                        <div className="text-xs font-medium mb-1.5" style={{ color: '#475569' }}>Causa</div>
                        <button
                            onClick={() => { setShowCauses(!showCauses); setCauseFilter(''); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border text-sm text-left"
                            style={{
                                borderColor: form.failureCause ? failureCatalog[failureCategory].color : '#E2E8F0',
                                backgroundColor: form.failureCause ? failureCatalog[failureCategory].color + '10' : '#F8FAFC',
                            }}
                        >
                            <span style={{ color: form.failureCause ? '#0F172A' : '#94A3B8' }}>
                                {form.failureCause || 'Seleccionar causa...'}
                            </span>
                            <ChevronDown className="w-4 h-4" style={{ color: '#94A3B8', transform: showCauses ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {showCauses && (
                            <div className="mt-1 border rounded-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                                <div className="sticky top-0 bg-white p-2 border-b" style={{ borderColor: '#F1F5F9' }}>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94A3B8' }} />
                                        <input
                                            type="text" value={causeFilter}
                                            onChange={(e) => setCauseFilter(e.target.value)}
                                            placeholder="Buscar causa..."
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none"
                                            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-36 overflow-y-auto">
                                    {failureCatalog[failureCategory].causes
                                        .filter(c => !causeFilter || c.toLowerCase().includes(causeFilter.toLowerCase()))
                                        .map(c => (
                                            <button
                                                key={c}
                                                onClick={() => { set('failureCause', c); setShowCauses(false); setCauseFilter(''); }}
                                                className="w-full text-left px-3 py-2 text-xs border-b last:border-b-0 active:bg-gray-50"
                                                style={{
                                                    borderColor: '#F1F5F9',
                                                    backgroundColor: form.failureCause === c ? failureCatalog[failureCategory].color + '15' : 'transparent',
                                                    fontWeight: form.failureCause === c ? 700 : 400,
                                                    color: form.failureCause === c ? failureCatalog[failureCategory].color : '#334155',
                                                }}
                                            >
                                                {c}
                                            </button>
                                        ))
                                    }
                                    {failureCatalog[failureCategory].causes.filter(c => !causeFilter || c.toLowerCase().includes(causeFilter.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-3 text-xs text-center" style={{ color: '#94A3B8' }}>Sin resultados</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary of selected failure */}
                    {(form.failureSymptom || form.failureObjectPart || form.failureCause) && (
                        <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                            <div className="text-xs font-semibold mb-1" style={{ color: '#92400E' }}>Resumen Falla</div>
                            <div className="text-xs" style={{ color: '#78350F' }}>
                                {[
                                    form.failureSymptom && `Síntoma: ${form.failureSymptom}`,
                                    form.failureObjectPart && `Parte: ${form.failureObjectPart}`,
                                    form.failureCause && `Causa: ${form.failureCause}`,
                                ].filter(Boolean).join(' → ')}
                            </div>
                            <button
                                onClick={() => { set('failureSymptom', ''); set('failureObjectPart', ''); set('failureCause', ''); }}
                                className="text-xs font-semibold mt-1.5"
                                style={{ color: '#DC2626' }}
                            >
                                Limpiar selección
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Sugerencia de acción */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        SUGERENCIA DE ACCIÓN *
                    </label>
                    <input
                        type="text"
                        value={form.suggestedAction}
                        onChange={(e) => set('suggestedAction', e.target.value)}
                        placeholder="Ej: Reemplazo de sello mecánico"
                        className="w-full p-3 rounded-xl border text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                    />
                </div>

                {/* Circunstancias (SAP IH01 — campo Detalle) */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        CIRCUNSTANCIAS / DETALLE
                    </label>
                    <textarea
                        value={form.circumstances}
                        onChange={(e) => set('circumstances', e.target.value)}
                        placeholder="Descripción del evento, recursos necesarios, equipos de apoyo, información complementaria..."
                        className="w-full h-20 p-3 rounded-xl border text-sm resize-none outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                    />
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                        SAP: Información complementaria del aviso
                    </div>
                </div>

                {/* 4. Recursos necesarios */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                            RECURSOS NECESARIOS *
                        </label>
                        <button onClick={addResource} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
                            + Agregar
                        </button>
                    </div>
                    {form.resources.length === 0 ? (
                        <div className="text-center py-4 text-xs" style={{ color: '#94A3B8' }}>No hay recursos agregados</div>
                    ) : (
                        <div className="space-y-2">
                            {form.resources.map((res, i) => (
                                <div key={i} className="relative p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                                    {/* Type — searchable combobox */}
                                    <div className="relative mb-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: '#94A3B8' }} />
                                            <input
                                                type="text" placeholder="Buscar tipo..." value={res.type}
                                                onChange={(e) => { updateResource(i, 'type', e.target.value); setActiveResTypeIdx(i); }}
                                                onFocus={() => setActiveResTypeIdx(i)}
                                                onBlur={() => setTimeout(() => setActiveResTypeIdx(-1), 150)}
                                                className="w-full pl-7 pr-2 p-2 rounded text-xs outline-none" style={{ border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        {activeResTypeIdx === i && (
                                            <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border rounded-lg shadow-lg z-20 max-h-32 overflow-y-auto" style={{ borderColor: '#E2E8F0' }}>
                                                {RESOURCE_TYPES
                                                    .filter(t => !res.type || t.toLowerCase().includes(res.type.toLowerCase()))
                                                    .map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => { updateResource(i, 'type', t); setActiveResTypeIdx(-1); }}
                                                            className="w-full text-left px-3 py-1.5 text-xs border-b last:border-b-0 active:bg-gray-50"
                                                            style={{ borderColor: '#F1F5F9', color: '#334155' }}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                    {/* Quantity + Hours */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text" placeholder="Cant." value={res.quantity}
                                            onChange={(e) => updateResource(i, 'quantity', e.target.value)}
                                            className="p-2 rounded text-xs outline-none" style={{ border: '1px solid #E2E8F0' }}
                                        />
                                        <div className="flex gap-1">
                                            <input
                                                type="text" placeholder="Horas" value={res.hours}
                                                onChange={(e) => updateResource(i, 'hours', e.target.value)}
                                                className="flex-1 p-2 rounded text-xs outline-none" style={{ border: '1px solid #E2E8F0' }}
                                            />
                                            <button onClick={() => removeResource(i)} className="px-1">
                                                <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. Duración estimada */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        DURACIÓN ESTIMADA (HORAS) *
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
                        <input
                            type="number"
                            value={form.estimatedDuration}
                            onChange={(e) => set('estimatedDuration', e.target.value)}
                            placeholder="4"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                        />
                    </div>
                </div>

                {/* 6. Materiales SAP */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                            MATERIALES (SAP)
                        </label>
                        <button onClick={addMaterial} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
                            + Agregar
                        </button>
                    </div>
                    {form.materials.length === 0 ? (
                        <div className="text-center py-4 text-xs" style={{ color: '#94A3B8' }}>No hay materiales agregados</div>
                    ) : (
                        <div className="space-y-2">
                            {form.materials.map((mat, i) => (
                                <div key={i} className="relative p-2 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                                    {/* SAP ID — searchable combobox */}
                                    <div className="relative mb-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: '#94A3B8' }} />
                                            <input
                                                type="text" placeholder="Buscar material SAP..." value={mat.sapId}
                                                onChange={(e) => { updateMaterial(i, 'sapId', e.target.value); setActiveMatSapIdx(i); }}
                                                onFocus={() => setActiveMatSapIdx(i)}
                                                onBlur={() => setTimeout(() => setActiveMatSapIdx(-1), 150)}
                                                className="w-full pl-7 pr-2 p-2 rounded text-xs outline-none" style={{ border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        {activeMatSapIdx === i && (
                                            <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border rounded-lg shadow-lg z-20 max-h-32 overflow-y-auto" style={{ borderColor: '#E2E8F0' }}>
                                                {COMMON_MATERIALS
                                                    .filter(m => !mat.sapId || m.sapId.includes(mat.sapId) || m.desc.toLowerCase().includes(mat.sapId.toLowerCase()))
                                                    .map(m => (
                                                        <button
                                                            key={m.sapId}
                                                            onClick={() => { updateMaterial(i, 'sapId', m.sapId); updateMaterial(i, 'description', m.desc); setActiveMatSapIdx(-1); }}
                                                            className="w-full text-left px-3 py-1.5 border-b last:border-b-0 active:bg-gray-50"
                                                            style={{ borderColor: '#F1F5F9' }}
                                                        >
                                                            <span className="text-xs font-mono font-bold" style={{ color: '#0F172A' }}>{m.sapId}</span>
                                                            <span className="text-xs ml-1.5" style={{ color: '#64748B' }}>{m.desc}</span>
                                                        </button>
                                                    ))
                                                }
                                                {COMMON_MATERIALS.filter(m => !mat.sapId || m.sapId.includes(mat.sapId) || m.desc.toLowerCase().includes(mat.sapId.toLowerCase())).length === 0 && (
                                                    <div className="px-3 py-2 text-xs text-center" style={{ color: '#94A3B8' }}>Sin resultados — usa ID manual</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* Quantity + Description */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text" placeholder="Cant." value={mat.quantity}
                                            onChange={(e) => updateMaterial(i, 'quantity', e.target.value)}
                                            className="p-2 rounded text-xs outline-none" style={{ border: '1px solid #E2E8F0' }}
                                        />
                                        <div className="flex gap-1">
                                            <input
                                                type="text" placeholder="Descripción" value={mat.description}
                                                onChange={(e) => updateMaterial(i, 'description', e.target.value)}
                                                className="flex-1 p-2 rounded text-xs outline-none" style={{ border: '1px solid #E2E8F0' }}
                                            />
                                            <button onClick={() => removeMaterial(i)} className="px-1">
                                                <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 7. Equipos especiales */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        EQUIPOS ESPECIALES
                    </label>
                    <div className="relative">
                        <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: '#94A3B8' }} />
                        <input
                            type="text"
                            value={form.specialEquipment}
                            onChange={(e) => { set('specialEquipment', e.target.value); setShowSpecEquip(true); }}
                            onFocus={() => setShowSpecEquip(true)}
                            onBlur={() => setTimeout(() => setShowSpecEquip(false), 150)}
                            placeholder="Ej: Grúa 20 ton, Andamios"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                        />
                        {showSpecEquip && (
                            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#E2E8F0' }}>
                                {SPECIAL_EQUIPMENT.filter(se => !form.specialEquipment || se.toLowerCase().includes(form.specialEquipment.toLowerCase())).map(se => (
                                    <button key={se} onClick={() => {
                                        const cur = form.specialEquipment;
                                        set('specialEquipment', cur ? `${cur}, ${se}` : se);
                                        setShowSpecEquip(false);
                                    }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>{se}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Autor del Aviso (SAP IH01 — quién reporta el evento) */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        AUTOR DEL AVISO
                    </label>
                    <input
                        type="text"
                        value={form.reportedBy}
                        onChange={(e) => set('reportedBy', e.target.value)}
                        placeholder="Nombre de quién reporta el evento (si es distinto del creador)"
                        className="w-full p-3 rounded-xl border text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                    />
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                        SAP: Quién descubrió el problema (no necesariamente quién crea el aviso)
                    </div>
                </div>

                {/* Equipos de apoyo (SAP IH01) */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        EQUIPOS DE APOYO
                    </label>
                    <input
                        type="text"
                        value={form.supportEquipment}
                        onChange={(e) => set('supportEquipment', e.target.value)}
                        placeholder="Ej: Grúa puente 10 ton, Camión grúa, Generador"
                        className="w-full p-3 rounded-xl border text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                    />
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                        Separar con comas. Ej: Grúa 20t, Andamio, Camión pluma
                    </div>
                </div>

                {/* 8. Condición del equipo */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        CONDICIÓN DEL EQUIPO *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {PLANT_CONDITIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    set('plantCondition', opt.value);
                                    if (opt.value === 'stopped' && form.priority !== 'P1') {
                                        set('priority', 'P1');
                                        set('activityClass', 'CR');
                                    }
                                }}
                                className="p-3 rounded-xl border-2 transition-all active:scale-95"
                                style={{
                                    borderColor: form.plantCondition === opt.value ? opt.color : '#E2E8F0',
                                    backgroundColor: form.plantCondition === opt.value ? opt.color + '15' : '#FFFFFF',
                                }}
                            >
                                <div className="text-sm font-bold" style={{ color: form.plantCondition === opt.value ? opt.color : '#64748B' }}>
                                    {opt.label}
                                </div>
                            </button>
                        ))}
                    </div>
                    {form.plantCondition === 'stopped' && (
                        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#EF4444' }} />
                            <span className="text-xs font-medium" style={{ color: '#B91C1C' }}>Equipo detenido — Prioridad ajustada a P1 (Urgente)</span>
                        </div>
                    )}
                </div>

                {/* 9. Prioridad + Clasificación SAP PM */}
                <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                    <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                        PRIORIDAD DEL AVISO
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {PRIORITIES.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => {
                                    set('priority', p.value);
                                    // Auto-select first activity class for the derived OT class
                                    const activities = ACTIVITY_CLASSES[p.claseOT] || [];
                                    if (activities.length && !activities.find(a => a.value === form.activityClass)) {
                                        set('activityClass', activities[0].value);
                                    }
                                }}
                                className="p-3 rounded-xl border-2 transition-all active:scale-95 text-left"
                                style={{
                                    borderColor: form.priority === p.value ? p.color : '#E2E8F0',
                                    backgroundColor: form.priority === p.value ? p.bg : '#FFFFFF',
                                }}
                            >
                                <div className="text-sm font-bold" style={{ color: p.color }}>
                                    {p.label}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: form.priority === p.value ? p.color : '#94A3B8' }}>
                                    {p.sub}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Derived OT class indicator */}
                    {(() => {
                        const sel = PRIORITIES.find(p => p.value === form.priority);
                        if (!sel) return null;
                        return (
                            <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#F1F5F9' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold" style={{ color: '#64748B' }}>Clase Aviso</div>
                                        <div className="text-sm font-bold" style={{ color: '#0F172A' }}>A1 Aviso Mantenimiento</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                    <div>
                                        <div className="text-xs font-semibold" style={{ color: '#64748B' }}>Clase OT</div>
                                        <div className="text-sm font-bold" style={{ color: sel.color }}>{sel.claseOT} {sel.claseOTLabel}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* 10. Clase de Actividad */}
                {(() => {
                    const sel = PRIORITIES.find(p => p.value === form.priority);
                    const activities = sel ? (ACTIVITY_CLASSES[sel.claseOT] || []) : [];
                    if (!activities.length) return null;
                    return (
                        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                            <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                                CLASE DE ACTIVIDAD
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {activities.map((a) => (
                                    <button
                                        key={a.value}
                                        onClick={() => set('activityClass', a.value)}
                                        className="px-4 py-2.5 rounded-xl border-2 transition-all active:scale-95"
                                        style={{
                                            borderColor: form.activityClass === a.value ? '#3B82F6' : '#E2E8F0',
                                            backgroundColor: form.activityClass === a.value ? '#EFF6FF' : '#FFFFFF',
                                            color: form.activityClass === a.value ? '#1D4ED8' : '#475569',
                                        }}
                                    >
                                        <span className="text-sm font-semibold">{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* Evidencia fotográfica */}
                {form.photos.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#E2E8F0' }}>
                        <label className="text-xs font-semibold mb-3 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
                            EVIDENCIA FOTOGRÁFICA
                        </label>
                        <div className="flex gap-2 overflow-x-auto">
                            {form.photos.map((photo, i) => (
                                <div key={i} className="relative flex-shrink-0">
                                    <img src={photo} alt="" className="w-20 h-20 rounded-xl object-cover border" style={{ borderColor: '#E2E8F0' }} />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                        style={{ backgroundColor: '#EF4444' }}
                                    >×</button>
                                </div>
                            ))}
                            <button
                                onClick={handleCamera}
                                className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center"
                                style={{ borderColor: '#CBD5E1' }}
                            >
                                <Camera className="w-6 h-6" style={{ color: '#94A3B8' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Documentación de apoyo */}
                <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: '#1E40AF', letterSpacing: '0.05em' }}>
                        DOCUMENTACIÓN DE APOYO
                    </div>
                    <div className="space-y-2">
                        {[
                            { icon: FileText, label: 'Manual de Equipo', id: form.whereTag || '—' },
                            { icon: Wrench, label: 'Troubleshooting', id: 'TS-BOMBA' },
                            { icon: Package, label: 'Catálogo Repuestos', id: 'CAT-REP' },
                        ].map((doc, i) => {
                            const Icon = doc.icon;
                            return (
                                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white active:bg-gray-50">
                                    <Icon className="w-5 h-5" style={{ color: '#3B82F6' }} />
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{doc.label}</div>
                                        <div className="text-xs" style={{ color: '#64748B' }}>{doc.id}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sticky submit */}
            <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 pt-2" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="max-w-md mx-auto">
                    <button
                        disabled={!canSubmit || submitting}
                        onClick={handleSubmit}
                        className="w-full rounded-2xl py-4 text-base font-bold transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: '#047857',
                            color: '#FFFFFF',
                            boxShadow: canSubmit ? '0 10px 25px rgba(4, 120, 87, 0.2)' : 'none',
                        }}
                    >
                        {submitting ? 'Enviando...' : 'Enviar Aviso'}
                    </button>
                    {!canSubmit && (
                        <div className="text-center mt-2 text-xs" style={{ color: '#64748B' }}>
                            Completa los campos obligatorios (*)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
