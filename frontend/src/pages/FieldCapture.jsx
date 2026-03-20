import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, ArrowRight, ArrowLeft, Camera, Mic, MicOff, Search, Edit3, ChevronDown } from 'lucide-react';
import * as api from '../api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const PRIORITY_OPTIONS = [
    { value: '1_EMERGENCY', key: 'emergency', color: 'bg-red-600' },
    { value: '2_URGENT', key: 'urgent', color: 'bg-orange-500' },
    { value: '3_NORMAL', key: 'normal', color: 'bg-blue-500' },
    { value: '4_PLANNED', key: 'planned', color: 'bg-gray-500' },
];

function StageIndicator({ stage, labels }) {
    return (
        <div className="flex items-center justify-between mb-6 px-2">
            {labels.map((name, idx) => {
                const isCompleted = idx < stage;
                const isActive = idx === stage;
                return (
                    <div key={idx} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                                    ${isCompleted ? 'bg-primary border-primary text-primary-foreground'
                                    : isActive ? 'bg-white border-primary text-primary'
                                    : 'bg-muted border-border text-muted-foreground'}`}
                            >
                                {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium text-center leading-tight max-w-[70px]
                                ${isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'}`}>
                                {name}
                            </span>
                        </div>
                        {idx < labels.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded transition-colors ${idx < stage ? 'bg-primary' : 'bg-border'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function EditableField({ label, value, onChange, type = 'text', options, placeholder }) {
    const [editing, setEditing] = useState(false);

    if (options) {
        return (
            <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</div>
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold border-none focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="p-3 bg-muted/40 rounded-lg border border-border group">
            <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
                <button
                    onClick={() => setEditing(!editing)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground"
                    title="Edit"
                >
                    <Edit3 size={12} />
                </button>
            </div>
            {editing ? (
                <input
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    onBlur={() => setEditing(false)}
                    onKeyDown={e => e.key === 'Enter' && setEditing(false)}
                    autoFocus
                    className="w-full bg-background text-sm font-semibold border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={placeholder}
                />
            ) : (
                <p className="font-semibold text-sm cursor-pointer" onClick={() => setEditing(true)}>
                    {value || <span className="text-muted-foreground italic">Click to edit</span>}
                </p>
            )}
        </div>
    );
}

export default function FieldCapture() {
    const { plant } = useOutletContext();
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useLanguage();
    const [rawText, setRawText] = useState('');
    const [equipTag, setEquipTag] = useState('');
    const [workRequests, setWorkRequests] = useState([]);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [stage, setStage] = useState(0);
    const [checks, setChecks] = useState([false, false, false, false]);
    const [generatedWR, setGeneratedWR] = useState('');
    const recognitionRef = useRef(null);
    const baseTextRef = useRef('');
    const cameraRef = useRef(null);

    // Editable AI fields
    const [editEquipment, setEditEquipment] = useState('');
    const [editPriority, setEditPriority] = useState('3_NORMAL');
    const [editFailureMode, setEditFailureMode] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editImpact, setEditImpact] = useState('');
    const [failureModeSearch, setFailureModeSearch] = useState('');
    const [showFMList, setShowFMList] = useState(false);
    const [availableFMs, setAvailableFMs] = useState([]);
    const [spareSearch, setSpareSearch] = useState('');
    const [spareParts, setSpareParts] = useState([]);

    const STAGE_LABELS = [t('capture.step1'), t('capture.step2'), t('capture.step3')];

    const VALIDATION_CHECKS = [
        t('workRequests.priorityConfirmed'),
        t('workRequests.failureModeValidated'),
        t('workRequests.sparePartsVerified'),
        t('workRequests.personnelAvailable'),
    ];

    useEffect(() => {
        api.listWorkRequests().then(r => setWorkRequests(Array.isArray(r) ? r : r?.items || [])).catch(() => {});
        // Load available failure modes
        api.listFailureModes?.().then(fms => {
            if (Array.isArray(fms)) setAvailableFMs(fms);
        }).catch(() => {});
    }, []);

    // When AI result comes in, populate editable fields
    useEffect(() => {
        if (result) {
            setEditEquipment(result.equipment_tag || result.equipment_identification?.equipment_tag || '');
            setEditPriority(result.priority_suggested || result.ai_classification?.priority_suggested || '3_NORMAL');
            setEditFailureMode(result.failure_mode_detected || '');
            setEditDuration(result.estimated_duration || result.ai_classification?.estimated_duration || '8');
            setEditImpact(result.work_order_type || result.ai_classification?.work_order_type || 'PM01_INSPECTION');
            setSpareParts(result.spare_parts || []);
        }
    }, [result]);

    const handleSubmit = async () => {
        if (!rawText && !capturedImage) return;
        setSubmitting(true);
        try {
            const res = await api.submitCapture({
                capture_type: capturedImage ? 'IMAGE' : 'TEXT',
                raw_text_input: rawText || (capturedImage ? 'Image observation' : undefined),
                equipment_tag_manual: equipTag,
                plant_id: plant,
                image_data: capturedImage || undefined,
            });
            setResult(res);
            toast.success(t('capture.aiResults'));
            api.listWorkRequests().then(r => setWorkRequests(Array.isArray(r) ? r : r?.items || [])).catch(() => {});
            setStage(1);
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setSubmitting(false);
    };

    const handleVoiceRecord = () => {
        if (!SpeechRecognition) {
            toast.error('Your browser does not support speech recognition. Use Chrome or Edge.');
            return;
        }
        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognitionRef.current = recognition;
        baseTextRef.current = rawText;
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
            setRawText((base + sep + finalTranscript + interim).trimEnd());
        };
        recognition.onerror = (event) => {
            setIsRecording(false);
            if (event.error === 'not-allowed') toast.error('Microphone access denied.');
            else if (event.error !== 'aborted') toast.error('Speech error: ' + event.error);
        };
        recognition.onend = () => {
            setIsRecording(false);
            if (finalTranscript.trim()) {
                const base = baseTextRef.current;
                const sep = base ? '\n' : '';
                setRawText((base + sep + finalTranscript).trimEnd());
                toast.success('Voice transcription added');
            }
        };
        recognition.start();
    };

    // Camera capture only — no file upload from gallery
    const handleCameraCapture = () => {
        cameraRef.current?.click();
    };

    const handleCameraChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setCapturedImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleValidateAndSubmit = async () => {
        if (!result?.work_request_id && !result?.request_id) return;
        try {
            const id = result.work_request_id || result.request_id;
            await api.validateWorkRequest(id, {
                action: 'MODIFY',
                modifications: {
                    equipment_tag: editEquipment,
                    priority: editPriority,
                    failure_mode: editFailureMode,
                    estimated_duration: editDuration,
                    work_order_type: editImpact,
                },
            });
            setResult(prev => ({ ...prev, status: 'PENDING_VALIDATION' }));
            const wrNum = 'WR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
            setGeneratedWR(wrNum);
            toast.success(t('capture.wrGenerated'));
            setStage(2);
        } catch (e) {
            toast.error('Validation failed: ' + e.message);
        }
    };

    const handleReject = async () => {
        if (!result?.work_request_id && !result?.request_id) return;
        try {
            const id = result.work_request_id || result.request_id;
            await api.validateWorkRequest(id, { action: 'REJECT' });
            setResult(prev => ({ ...prev, status: 'REJECTED' }));
            toast.warning('Work request rejected');
        } catch (e) {
            toast.error('Reject failed: ' + e.message);
        }
    };

    const toggleCheck = (idx) => setChecks(prev => prev.map((v, i) => i === idx ? !v : v));
    const allChecked = checks.every(Boolean);

    const resetToStage0 = () => {
        setStage(0);
        setResult(null);
        setRawText('');
        setEquipTag('');
        setCapturedImage(null);
        setChecks([false, false, false, false]);
        setGeneratedWR('');
        setEditEquipment('');
        setEditPriority('3_NORMAL');
        setEditFailureMode('');
        setEditDuration('');
        setEditImpact('');
        setSpareParts([]);
    };

    const filteredFMs = availableFMs.filter(fm =>
        fm.label?.toLowerCase().includes(failureModeSearch.toLowerCase()) ||
        fm.id?.toLowerCase().includes(failureModeSearch.toLowerCase())
    );

    const stockBadge = (status) => {
        const colors = { IN_STOCK: 'bg-green-100 text-green-700', LOW_STOCK: 'bg-amber-100 text-amber-700', OUT_OF_STOCK: 'bg-red-100 text-red-700' };
        return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{(status || 'UNKNOWN').replace('_', ' ')}</span>;
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{t('capture.title')}</h1>
            <p className="text-sm text-muted-foreground mb-5">{t('capture.subtitle')}</p>

            {/* Hidden camera input — capture attribute forces camera, not gallery */}
            <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraChange}
                className="hidden"
            />

            {/* Stage indicator */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-5">
                <StageIndicator stage={stage} labels={STAGE_LABELS} />
            </div>

            {/* ── Stage 0: Capture Form ── */}
            {stage === 0 && (
                <div className="bg-card rounded-xl p-5 shadow-md mb-5">
                    <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-5">
                        {t('capture.step1')}
                    </div>

                    <div className="mb-3.5">
                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                            {t('capture.describeObservation')}
                        </div>
                        <textarea
                            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[120px] resize-y"
                            value={rawText}
                            onChange={e => {
                                const text = e.target.value;
                                setRawText(text);
                                // Auto-extract equipment tag from text
                                if (!equipTag) {
                                    const match = text.match(/\b([A-Z]{1,5}(?:-[A-Z0-9]{1,6}){1,5})\b/);
                                    if (match) setEquipTag(match[1]);
                                }
                            }}
                            placeholder={t('capture.placeholder')}
                            rows={4}
                            aria-label="Observation detail"
                        />
                    </div>

                    <div className="flex gap-4 mb-3.5 flex-wrap">
                        <button
                            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors ${isRecording ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'border border-border bg-card hover:bg-muted'}`}
                            onClick={handleVoiceRecord}
                        >
                            {isRecording ? <><MicOff size={16} /> {t('capture.listening')}</> : <><Mic size={16} /> {t('capture.voiceToText')}</>}
                        </button>

                        <button
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                            onClick={handleCameraCapture}
                        >
                            <Camera size={16} /> {capturedImage ? t('capture.retakePhoto') || 'Retake Photo' : t('capture.takePhoto')}
                        </button>
                    </div>

                    {capturedImage && (
                        <div className="mb-3.5 relative">
                            <img src={capturedImage} alt="Preview" className="w-full max-h-[200px] object-contain rounded-lg border border-border" />
                            <button
                                className="absolute top-1.5 right-1.5 px-2 py-0.5 text-xs rounded bg-black/60 text-white border-none"
                                onClick={() => setCapturedImage(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="mb-3.5">
                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                            {t('capture.equipmentTag')}
                        </div>
                        <input
                            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            value={equipTag}
                            onChange={e => setEquipTag(e.target.value)}
                            placeholder={t('capture.equipmentTagHint')}
                        />
                    </div>

                    <button
                        className="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        onClick={handleSubmit}
                        disabled={submitting || (!rawText && !capturedImage)}
                    >
                        {submitting ? t('capture.processing') : <>{t('capture.submitCapture')} <ArrowRight size={16} /></>}
                    </button>
                </div>
            )}

            {/* ── Stage 1: Validation + Editable AI Results ── */}
            {stage === 1 && result && (
                <div className="bg-card rounded-xl p-6 shadow-md mb-5">
                    <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-5">
                        {t('capture.step2')} — {t('capture.aiResults')}
                    </div>

                    {/* Captured photo preview */}
                    {capturedImage && (
                        <div className="mb-5 rounded-lg overflow-hidden border border-border">
                            <img src={capturedImage} alt="Captured" className="w-full max-h-[250px] object-contain bg-muted/30" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Left: Editable AI fields */}
                        <div className="space-y-3">
                            <div className="flex gap-2 flex-wrap mb-2">
                                <StatusBadge status={result.status || 'DRAFT'} />
                                {result.equipment_confidence != null && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                        {t('capture.confidence')}: {Math.round((result.equipment_confidence || 0) * 100)}%
                                    </span>
                                )}
                            </div>

                            <EditableField
                                label={t('capture.identifiedEquipment')}
                                value={editEquipment}
                                onChange={setEditEquipment}
                                placeholder="BRY-SAG-ML-001"
                            />

                            <EditableField
                                label={t('capture.suggestedPriority')}
                                value={editPriority}
                                onChange={setEditPriority}
                                options={PRIORITY_OPTIONS.map(p => ({ value: p.value, label: t(`capture.priorities.${p.key}`) }))}
                            />

                            {/* Failure Mode with search/select */}
                            <div className="p-3 bg-muted/40 rounded-lg border border-border">
                                <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                    {t('capture.detectedFailureMode')}
                                </div>
                                <div className="relative">
                                    <input
                                        value={editFailureMode}
                                        onChange={e => { setEditFailureMode(e.target.value); setFailureModeSearch(e.target.value); setShowFMList(availableFMs.length > 0); }}
                                        onFocus={() => { if (availableFMs.length > 0) setShowFMList(true); }}
                                        onBlur={() => setTimeout(() => setShowFMList(false), 200)}
                                        placeholder={t('capture.selectFailureMode')}
                                        className="w-full bg-background text-sm font-semibold border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                                    />
                                    {availableFMs.length > 0 && <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                                    {showFMList && filteredFMs.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                            {filteredFMs.slice(0, 10).map(fm => (
                                                <button
                                                    key={fm.id}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                    onMouseDown={() => { setEditFailureMode(fm.label); setShowFMList(false); }}
                                                >
                                                    <span className="font-mono text-xs text-muted-foreground mr-2">{fm.id}</span>
                                                    {fm.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label={t('capture.estimatedDuration')} value={editDuration} onChange={setEditDuration} placeholder="8h" />
                                <EditableField label={t('capture.workOrderType')} value={editImpact} onChange={setEditImpact} placeholder="PM02_PREVENTIVE" />
                            </div>
                        </div>

                        {/* Right: Spare parts + Validation checklist */}
                        <div className="space-y-4">
                            {/* Spare Parts with search */}
                            <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider">{t('capture.spareParts')}</div>
                                    <button
                                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                        onClick={() => toast.info('Searching BOM...')}
                                    >
                                        <Search size={12} /> {t('capture.searchSpares')}
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    {spareParts.map((part, i) => (
                                        <li key={i} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] text-muted-foreground">{part.code}</span>
                                                <span>{part.desc}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">x{part.qty}</span>
                                                {stockBadge(part.status)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Validation checklist */}
                            <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
                                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                                    {t('workRequests.validationChecklist')}
                                </div>
                                <div className="space-y-2">
                                    {VALIDATION_CHECKS.map((label, idx) => (
                                        <label key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                                            <input type="checkbox" checked={checks[idx]} onChange={() => toggleCheck(idx)} className="w-4 h-4 accent-primary flex-shrink-0" />
                                            <span className={`text-sm ${checks[idx] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{label}</span>
                                            {checks[idx] && <CheckCircle size={14} className="text-primary ml-auto flex-shrink-0" />}
                                        </label>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground text-center">{checks.filter(Boolean).length} / {checks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted" onClick={() => { setStage(0); setResult(null); }}>
                            <ArrowLeft size={16} /> {t('common.back')}
                        </button>
                        <div className="flex gap-3">
                            <button className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-transparent text-destructive border border-destructive hover:bg-destructive/10" onClick={handleReject}>
                                {t('common.reject')}
                            </button>
                            <button
                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${allChecked ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                                onClick={handleValidateAndSubmit}
                                disabled={!allChecked}
                            >
                                {t('capture.confirmAndSubmit')} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stage 2: Success Confirmation ── */}
            {stage === 2 && (
                <div className="bg-card rounded-xl p-8 shadow-md mb-5 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle size={36} className="text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">{t('capture.wrGenerated')}</h2>
                    <p className="text-muted-foreground mb-4">{t('workRequests.title')}</p>

                    {generatedWR && (
                        <div className="inline-block px-5 py-3 bg-green-50 border border-green-200 rounded-xl mb-6">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('capture.wrId')}</div>
                            <div className="text-2xl font-bold font-mono text-green-700">{generatedWR}</div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center">
                        <button
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg border border-border hover:bg-muted"
                            onClick={() => navigate('/work-requests')}
                        >
                            {t('capture.goToWorkRequests')}
                        </button>
                        <button
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            onClick={resetToStage0}
                        >
                            {t('capture.newCapture')} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Recent Work Requests table ── */}
            <div className="bg-card rounded-xl p-5 shadow-md">
                <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-4">
                    {t('workRequests.title')}
                </div>
                {workRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>ID</th><th>{t('common.equipment')}</th><th>{t('common.status')}</th><th>{t('common.priority')}</th><th>{t('common.type')}</th></tr></thead>
                            <tbody>
                                {workRequests.slice(0, 10).map((wr, i) => (
                                    <tr key={i}>
                                        <td className="font-mono text-xs">{(wr.request_id || '').slice(0, 8)}</td>
                                        <td>{wr.equipment_identification?.equipment_tag || wr.equipment_tag || '—'}</td>
                                        <td><StatusBadge status={wr.status} /></td>
                                        <td><PriorityBadge priority={wr.ai_classification?.priority_suggested || wr.priority || '3'} /></td>
                                        <td className="font-mono text-xs">{wr.ai_classification?.work_order_type || wr.work_order_type || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-muted-foreground">{t('common.noData')}</p>}
            </div>
        </div>
    );
}
