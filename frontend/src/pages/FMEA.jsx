import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DataTable, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import * as api from '../api';

export default function FMEA() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState('');
    const [functions, setFunctions] = useState([]);
    const [fms, setFms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailFm, setDetailFm] = useState(null);
    const [combos, setCombos] = useState([]);
    const [showAddFunc, setShowAddFunc] = useState(false);
    const [newFuncDesc, setNewFuncDesc] = useState('');
    const [newFuncType, setNewFuncType] = useState('PRIMARY');

    useEffect(() => {
        api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' }).then(setNodes).catch(() => { });
        setLoading(false);
    }, [plant]);

    const loadFMEA = async (nodeId) => {
        setSelectedNode(nodeId);
        setLoading(true);
        try {
            const fns = await api.listFunctions(nodeId);
            setFunctions(fns);
            const allFms = [];
            for (const fn of fns) {
                const ffs = await api.listFunctionalFailures(fn.function_id);
                for (const ff of ffs) {
                    const modes = await api.listFailureModes(ff.failure_id);
                    modes.forEach(m => allFms.push({ ...m, function_desc: fn.description, failure_desc: ff.description }));
                }
            }
            setFms(allFms);
        } catch (e) {
            toast.error('Failed to load FMEA: ' + e.message);
        }
        setLoading(false);
    };

    useEffect(() => { api.getFmCombinations().then(setCombos).catch(() => { }); }, []);

    const handleAddFunction = async () => {
        if (!selectedNode || !newFuncDesc.trim()) return;
        try {
            await api.createFunction({ node_id: selectedNode, function_type: newFuncType, description: newFuncDesc.trim() });
            toast.success('Function created');
            setShowAddFunc(false);
            setNewFuncDesc('');
            loadFMEA(selectedNode);
        } catch (e) {
            toast.error('Failed to create function: ' + e.message);
        }
    };

    const handleValidateAll = async () => {
        let valid = 0, invalid = 0;
        for (const fm of fms) {
            if (fm.mechanism && fm.cause) {
                try {
                    const res = await api.validateFmCombo(fm.mechanism, fm.cause);
                    if (res.valid) valid++; else invalid++;
                } catch { invalid++; }
            }
        }
        toast.info(`Validation complete: ${valid} valid, ${invalid} invalid out of ${fms.length}`);
    };

    const columns = [
        { key: 'function_desc', label: 'Function', render: r => <span style={{ maxWidth: 180, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.function_desc || '—'}</span> },
        { key: 'failure_desc', label: 'Functional Failure', render: r => <span style={{ maxWidth: 150, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.failure_desc || '—'}</span> },
        { key: 'what', label: 'Failure Mode' },
        { key: 'mechanism', label: 'Mechanism', render: r => <span className="badge badge-info">{r.mechanism || '—'}</span> },
        { key: 'cause', label: 'Cause' },
        { key: 'strategy_type', label: 'Strategy', render: r => <span className="badge badge-purple">{r.strategy_type || r.rcm_decision || '—'}</span> },
    ];

    return (
        <div>
            <h1 className="page-title">🔬 FMEA & Strategy Development</h1>

            <div className="card" style={{ marginBottom: 16, padding: '12px 20px' }}>
                <div className="flex items-center gap" style={{ flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ width: 280 }} value={selectedNode} onChange={e => loadFMEA(e.target.value)} aria-label="Select equipment">
                        <option value="">Select Equipment...</option>
                        {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || n.name} — {n.name}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => selectedNode && loadFMEA(selectedNode)}>Load FMEA</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { if (!selectedNode) { toast.warning('Select equipment first'); return; } setShowAddFunc(true); }}>+ Add Function</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { if (fms.length === 0) { toast.warning('No failure modes to validate'); return; } handleValidateAll(); }}>Validate All</button>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {functions.length} Functions · {fms.length} Failure Modes · {combos.total_combinations || combos.length || 72} Valid FM Combos
                    </span>
                </div>
            </div>

            {showAddFunc && (
                <div className="card" style={{ marginBottom: 16, padding: '12px 20px', border: '2px solid var(--primary)' }}>
                    <div className="card-title" style={{ marginBottom: 12 }}>Add New Function</div>
                    <div className="flex items-center gap" style={{ flexWrap: 'wrap' }}>
                        <select className="form-select" style={{ width: 140 }} value={newFuncType} onChange={e => setNewFuncType(e.target.value)}>
                            <option value="PRIMARY">Primary</option>
                            <option value="SECONDARY">Secondary</option>
                            <option value="PROTECTIVE">Protective</option>
                        </select>
                        <input className="form-input" style={{ flex: 1 }} placeholder="Function description..." value={newFuncDesc} onChange={e => setNewFuncDesc(e.target.value)} />
                        <button className="btn btn-primary btn-sm" onClick={handleAddFunction} disabled={!newFuncDesc.trim()}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowAddFunc(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="split-panel">
                <div style={{ flex: '1 1 65%' }}>
                    <div className="card">
                        {loading ? <LoadingSpinner message="Loading FMEA data..." /> : (
                            <DataTable columns={columns} data={fms} onRowClick={r => setDetailFm(r)} emptyMsg="No FMEA data — Select equipment and load FMEA" sortable />
                        )}
                    </div>
                </div>
                <div style={{ flex: '0 0 33%' }}>
                    {detailFm ? (
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 16 }}>Failure Mode Detail</div>
                            <div className="form-group">
                                <div className="form-label">Mechanism</div>
                                <div className="badge badge-info" style={{ fontSize: '0.82rem' }}>{detailFm.mechanism || '—'}</div>
                            </div>
                            <div className="form-group">
                                <div className="form-label">Cause</div>
                                <p style={{ fontSize: '0.85rem' }}>{detailFm.cause || '—'}</p>
                            </div>
                            <div className="form-group">
                                <div className="form-label">Effect</div>
                                <p style={{ fontSize: '0.85rem' }}>{detailFm.effect || detailFm.local_effect || '—'}</p>
                            </div>
                            <div className="form-group">
                                <div className="form-label">Strategy</div>
                                <div className="badge badge-purple">{detailFm.strategy_type || detailFm.rcm_decision || '—'}</div>
                            </div>
                            {detailFm.ai_generated && <div className="badge badge-info" style={{ marginTop: 8 }}>🤖 AI Generated</div>}
                        </div>
                    ) : (
                        <div className="card"><div className="empty-state"><div className="empty-icon">🔍</div><h3>Select a failure mode</h3><p>Click on a row to view details</p></div></div>
                    )}
                </div>
            </div>
        </div>
    );
}
