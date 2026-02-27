import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../components/Shared';
import { useToast } from '../components/Toast';
import * as api from '../api';

export default function FieldCapture() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const [rawText, setRawText] = useState('');
    const [equipTag, setEquipTag] = useState('');
    const [workRequests, setWorkRequests] = useState([]);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);

    useEffect(() => {
        api.listWorkRequests().then(r => setWorkRequests(Array.isArray(r) ? r : r?.items || [])).catch(() => {});
    }, []);

    const handleSubmit = async () => {
        if (!rawText && !uploadedImage) return;
        setSubmitting(true);
        try {
            const captureType = uploadedImage && rawText ? 'VOICE+IMAGE'
                : uploadedImage ? 'IMAGE'
                : 'TEXT';
            const res = await api.submitCapture({
                capture_type: captureType,
                raw_text_input: rawText || undefined,
                equipment_tag_manual: equipTag,
                plant_id: plant,
            });
            setResult(res);
            toast.success('Observation submitted and processed by AI');
            api.listWorkRequests().then(r => setWorkRequests(Array.isArray(r) ? r : r?.items || [])).catch(() => {});
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setSubmitting(false);
    };

    const handleVoiceRecord = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setRawText(prev => {
                const transcription = 'Fast oil drip from main seal on primary pump. Needs immediate attention and absorbent pad beneath it.';
                return prev ? prev + '\n' + transcription : transcription;
            });
            toast.info('Voice transcription added');
        }, 3000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setUploadedImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleValidate = async () => {
        if (!result?.work_request_id && !result?.request_id) return;
        try {
            const id = result.work_request_id || result.request_id;
            await api.validateWorkRequest(id, { status: 'VALIDATED' });
            setResult(prev => ({ ...prev, status: 'VALIDATED' }));
            toast.success('Work request validated');
        } catch (e) {
            toast.error('Validation failed: ' + e.message);
        }
    };

    const handleReject = async () => {
        if (!result?.work_request_id && !result?.request_id) return;
        try {
            const id = result.work_request_id || result.request_id;
            await api.validateWorkRequest(id, { status: 'REJECTED' });
            setResult(prev => ({ ...prev, status: 'REJECTED' }));
            toast.warning('Work request rejected');
        } catch (e) {
            toast.error('Reject failed: ' + e.message);
        }
    };

    const handleModify = () => {
        setResult(null);
        toast.info('Modify the observation and re-submit');
    };

    return (
        <div>
            <div className="grid grid-2" style={{ marginBottom: 20, gap: 24 }}>
                <div className="card" style={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div className="card-title" style={{ marginBottom: 20, color: 'var(--primary-dark)', fontWeight: 800, letterSpacing: '0.05em' }}>
                        Submit Field Observation
                    </div>

                    <div className="form-group">
                        <div className="form-label">Observation Detail</div>
                        <textarea
                            className="form-textarea"
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                            placeholder="Describe the observation or problem detected..."
                            rows={4}
                            aria-label="Observation detail"
                        />
                    </div>

                    <div className="flex gap" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
                        <button
                            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'} flex items-center`}
                            onClick={handleVoiceRecord}
                            disabled={isRecording}
                            style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', minWidth: 140 }}
                            aria-label={isRecording ? 'Recording...' : 'Voice to text'}
                        >
                            {isRecording
                                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8 }} /> Listening...</>
                                : '🎤 Voice to Text'}
                        </button>

                        <label
                            htmlFor="img-upload"
                            className="btn btn-secondary flex items-center"
                            style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', padding: '10px 16px', minWidth: 140 }}
                        >
                            📷 {uploadedImage ? 'Change Photo' : 'Add Photo'}
                        </label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="img-upload" aria-label="Upload photo" />
                    </div>

                    {uploadedImage && (
                        <div style={{ marginBottom: 14, position: 'relative' }}>
                            <img
                                src={uploadedImage}
                                alt="Preview"
                                style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)' }}
                            />
                            <button
                                className="btn btn-sm"
                                onClick={() => setUploadedImage(null)}
                                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem' }}
                                aria-label="Remove photo"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="form-group">
                        <div className="form-label">Equipment Tag</div>
                        <input className="form-input" value={equipTag} onChange={e => setEquipTag(e.target.value)} placeholder="e.g., BRY-SAG-ML-001" aria-label="Equipment tag" />
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting || (!rawText && !uploadedImage)}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {submitting ? '⏳ Processing...' : '🚀 Submit for AI Processing'}
                    </button>
                </div>

                <div className="card" style={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div className="card-title" style={{ marginBottom: 20, color: 'var(--primary-dark)', fontWeight: 800, letterSpacing: '0.05em' }}>
                        AI-Processed Work Request
                    </div>
                    {result ? (
                        <div>
                            <div className="flex gap-sm flex-wrap" style={{ marginBottom: 12 }}>
                                <StatusBadge status={result.status || 'DRAFT'} />
                                {result.equipment_confidence != null && (
                                    <span className="badge badge-info">🤖 AI Confidence: {Math.round(result.equipment_confidence * 100)}%</span>
                                )}
                            </div>
                            <div style={{ marginBottom: 12, padding: 12, background: '#f0f7f0', borderRadius: 'var(--radius-sm)' }}>
                                <div className="form-label">Equipment Identified</div>
                                <p style={{ fontWeight: 600 }}>{result.equipment_tag || result.equipment_identification?.equipment_tag || '—'}</p>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div className="form-label">AI Classification</div>
                                <div className="flex gap-sm flex-wrap">
                                    <PriorityBadge priority={result.priority_suggested || result.ai_classification?.priority_suggested || '3'} />
                                </div>
                            </div>
                            {result.failure_mode_detected && (
                                <div style={{ marginBottom: 12 }}>
                                    <div className="form-label">Structured Description</div>
                                    <p style={{ fontSize: '0.85rem' }}>{result.failure_mode_detected}</p>
                                </div>
                            )}
                            <div className="flex gap-sm">
                                {result.status !== 'VALIDATED' && result.status !== 'REJECTED' && (
                                    <>
                                        <button className="btn btn-primary btn-sm" onClick={handleValidate}>✅ Validate</button>
                                        <button className="btn btn-secondary btn-sm" onClick={handleModify}>✏️ Modify</button>
                                        <button className="btn btn-sm" style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={handleReject}>❌ Reject</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🤖</div>
                            <h3>Submit an observation</h3>
                            <p>AI will process and structure it into a work request</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div className="card-title" style={{ marginBottom: 16, color: 'var(--primary-dark)', fontWeight: 800, letterSpacing: '0.05em' }}>
                    Recent Work Requests
                </div>
                {workRequests.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead><tr><th>ID</th><th>Equipment</th><th>Status</th><th>Priority</th><th>Type</th></tr></thead>
                            <tbody>
                                {workRequests.slice(0, 10).map((wr, i) => (
                                    <tr key={i}>
                                        <td className="mono">{(wr.request_id || '').slice(0, 8)}</td>
                                        <td>{wr.equipment_identification?.equipment_tag || wr.equipment_tag || '—'}</td>
                                        <td><StatusBadge status={wr.status} /></td>
                                        <td><PriorityBadge priority={wr.ai_classification?.priority_suggested || wr.priority || '3'} /></td>
                                        <td className="mono">{wr.ai_classification?.work_order_type || wr.work_order_type || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p style={{ color: 'var(--text-muted)' }}>No work requests yet</p>}
            </div>
        </div>
    );
}
