import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CritBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import * as api from '../api';

const FACTORS = ['Safety', 'Health', 'Environment', 'Production', 'Operating Cost', 'Capital Cost'];
const LEVELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
const LEVEL_COLORS = ['#4CAF50', '#FDD835', '#FF9800', '#E65100', '#C62828'];

export default function Criticality() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState('');
    const [scores, setScores] = useState(FACTORS.map(() => 3));
    const [probability, setProbability] = useState(3);
    const [result, setResult] = useState(null);
    const [assessing, setAssessing] = useState(false);

    useEffect(() => {
        api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' }).then(setNodes).catch(() => { });
    }, [plant]);

    const totalScore = scores.reduce((a, b) => a + b, 0) * probability / FACTORS.length;
    const riskClass = totalScore <= 7 ? { class: 'I', label: 'LOW', color: '#4CAF50' } : totalScore <= 18 ? { class: 'II', label: 'MEDIUM', color: '#FDD835' } : totalScore <= 24 ? { class: 'III', label: 'HIGH', color: '#E65100' } : { class: 'IV', label: 'CRITICAL', color: '#C62828' };

    const handleAssess = async () => {
        if (!selectedNode) return;
        setAssessing(true);
        try {
            const node = nodes.find(n => n.node_id === selectedNode);
            const res = await api.assessCriticality({
                equipment_id: selectedNode, plant_id: plant, equipment_tag: node?.tag || node?.code || '',
                consequence_safety: scores[0], consequence_health: scores[1], consequence_environment: scores[2],
                consequence_production: scores[3], consequence_operating_cost: scores[4], consequence_capital_cost: scores[5],
                probability_of_occurrence: probability,
            });
            setResult(res);
            toast.success('Assessment completed successfully');
        } catch (e) {
            toast.error('Assessment failed: ' + e.message);
        }
        setAssessing(false);
    };

    const handleApprove = async () => {
        if (!result?.criticality_id) return;
        try {
            await api.approveCriticality(result.criticality_id);
            setResult(prev => ({ ...prev, status: 'APPROVED' }));
            toast.success('Criticality approved');
        } catch (e) {
            toast.error('Approve failed: ' + e.message);
        }
    };

    const handleModify = () => {
        setResult(null);
        toast.info('Modify the scores and re-run the assessment');
    };

    return (
        <div>
            <h1 className="page-title">⚡ Criticality Assessment</h1>
            <div className="card" style={{ marginBottom: 16, padding: '12px 20px' }}>
                <div className="flex items-center gap" style={{ flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ width: 300 }} value={selectedNode} onChange={e => setSelectedNode(e.target.value)} aria-label="Select equipment">
                        <option value="">Select Equipment...</option>
                        {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || ''} — {n.name}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleAssess} disabled={assessing || !selectedNode}>
                        {assessing ? 'Assessing...' : '🔍 Run Assessment'}
                    </button>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: 20 }}>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>6-Factor Consequence Matrix</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead><tr><th>Factor</th>{LEVELS.map((l, i) => <th key={i} style={{ fontSize: '0.7rem' }}>{i + 1} — {l}</th>)}<th>Selected</th></tr></thead>
                            <tbody>
                                {FACTORS.map((f, fi) => (
                                    <tr key={f}>
                                        <td style={{ fontWeight: 600 }}>{f}</td>
                                        {LEVELS.map((_, li) => (
                                            <td key={li} onClick={() => { const ns = [...scores]; ns[fi] = li + 1; setScores(ns); }}
                                                style={{ cursor: 'pointer', textAlign: 'center', background: scores[fi] === li + 1 ? LEVEL_COLORS[li] + '30' : '' }}>
                                                {scores[fi] === li + 1 ? '●' : '○'}
                                            </td>
                                        ))}
                                        <td><span className="badge" style={{ background: LEVEL_COLORS[scores[fi] - 1] + '30', color: LEVEL_COLORS[scores[fi] - 1] }}>Level {scores[fi]}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <div className="form-label">Probability of Occurrence</div>
                        <div className="flex items-center gap">
                            <input type="range" min={1} max={5} value={probability} onChange={e => setProbability(Number(e.target.value))} style={{ flex: 1 }} aria-label="Probability of occurrence" />
                            <span className="badge badge-info">{probability} — {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][probability - 1]}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-title" style={{ marginBottom: 16 }}>Assessment Result</div>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: riskClass.color }}>{totalScore.toFixed(1)}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: riskClass.color, marginTop: 8 }}>Risk Class {riskClass.class} — {riskClass.label}</div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 4, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                                {[{ l: 'I', c: '#4CAF50', w: 28 }, { l: 'II', c: '#FDD835', w: 44 }, { l: 'III', c: '#FF9800', w: 24 }, { l: 'IV', c: '#C62828', w: 4 }].map(s => (
                                    <div key={s.l} style={{ height: 12, flex: `0 0 ${s.w}%`, background: s.c, position: 'relative' }}>
                                        {s.l === riskClass.class && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: '1rem' }}>▼</div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                <span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRIT</span>
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 12 }}>AI Assessment Result</div>
                            <div className="flex gap-sm" style={{ marginBottom: 8 }}>
                                <CritBadge crit={result.new_criticality || result.criticality} />
                                <StatusBadge status={result.status || 'DRAFT'} />
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.justification || 'Assessment completed'}</p>
                            <div className="flex gap-sm" style={{ marginTop: 12 }}>
                                {result.status !== 'APPROVED' && (
                                    <button className="btn btn-primary btn-sm" onClick={handleApprove}>✅ Approve</button>
                                )}
                                <button className="btn btn-secondary btn-sm" onClick={handleModify}>✏️ Modify</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
