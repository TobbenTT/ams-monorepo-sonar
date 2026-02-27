import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { StatusBadge, CritBadge, MetaChip, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const ICONS = { PLANT: '🏭', AREA: '📍', SYSTEM: '⚙️', EQUIPMENT: '🔧', SUB_ASSEMBLY: '🔩', MAINTAINABLE_ITEM: '🛠️' };

function TreeNode({ node, nodes, selected, onSelect, level = 0 }) {
    const [open, setOpen] = useState(level < 2);
    const children = nodes.filter(n => n.parent_node_id === node.node_id);
    const hasChildren = children.length > 0;

    return (
        <div>
            <div
                className={`tree-item${selected === node.node_id ? ' active' : ''}`}
                style={{ paddingLeft: 8 + level * 20 }}
                onClick={() => { onSelect(node.node_id); if (hasChildren) setOpen(!open); }}
                role="treeitem"
                aria-expanded={hasChildren ? open : undefined}
                aria-selected={selected === node.node_id}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.node_id); if (hasChildren) setOpen(!open); } }}
            >
                {hasChildren ? (open ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />) : <span style={{ width: 14 }} />}
                <span className="tree-icon" aria-hidden="true">{ICONS[node.node_type] || '📄'}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.code || ''} {node.name}
                </span>
                {node.criticality && <CritBadge crit={node.criticality} />}
            </div>
            {open && children.map(c => <TreeNode key={c.node_id} node={c} nodes={nodes} selected={selected} onSelect={onSelect} level={level + 1} />)}
        </div>
    );
}

export default function Hierarchy() {
    const { plant } = useOutletContext();
    const [nodes, setNodes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('general');
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        api.listNodes({ plant_id: plant }).then(n => { setNodes(n); setLoading(false); }).catch(() => setLoading(false));
    }, [plant]);

    useEffect(() => {
        if (selected) api.getNode(selected).then(setDetail).catch(() => { });
    }, [selected]);

    const filteredNodes = useMemo(() => {
        if (!search.trim()) return nodes;
        const q = search.toLowerCase();
        const matchIds = new Set();
        nodes.forEach(n => {
            if ((n.name || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.tag || '').toLowerCase().includes(q)) {
                matchIds.add(n.node_id);
                let parent = n.parent_node_id;
                while (parent) {
                    matchIds.add(parent);
                    parent = nodes.find(p => p.node_id === parent)?.parent_node_id;
                }
            }
        });
        return nodes.filter(n => matchIds.has(n.node_id));
    }, [nodes, search]);

    const roots = filteredNodes.filter(n => !n.parent_node_id);
    const stats = {};
    nodes.forEach(n => { stats[n.node_type] = (stats[n.node_type] || 0) + 1; });

    return (
        <div>
            <h1 className="page-title">🏗️ Equipment Hierarchy Explorer</h1>
            <div className="split-panel">
                <div className="split-left">
                    <div className="tree-panel">
                        <div className="tree-header flex items-center justify-between">
                            <span>Asset Tree</span>
                            <span className="badge badge-success">{nodes.length} nodes</span>
                        </div>
                        <div style={{ padding: '8px 12px' }}>
                            <input
                                className="form-input"
                                placeholder="🔍 Search nodes..."
                                style={{ fontSize: '0.82rem' }}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                aria-label="Search equipment tree"
                            />
                        </div>
                        <div className="tree-body" role="tree">
                            {loading ? <LoadingSpinner /> : roots.length === 0 && search ? (
                                <p style={{ padding: 16, color: 'var(--text-muted)', textAlign: 'center' }}>No nodes match "{search}"</p>
                            ) : roots.map(r => <TreeNode key={r.node_id} node={r} nodes={filteredNodes} selected={selected} onSelect={setSelected} />)}
                        </div>
                        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {Object.entries(stats).map(([k, v]) => `${v} ${k}`).join(' · ')}
                        </div>
                    </div>
                </div>

                <div className="split-right">
                    {!detail ? (
                        <div className="empty-state"><div className="empty-icon">🔍</div><h3>Select a node</h3><p>Click on an asset in the tree to view details</p></div>
                    ) : (
                        <div>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="flex items-center gap-sm" style={{ marginBottom: 8 }}>
                                    <span className="badge badge-success">{detail.node_type}</span>
                                    <StatusBadge status={detail.status || 'ACTIVE'} />
                                    <CritBadge crit={detail.criticality} />
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{detail.name}</h2>
                                <div className="flex gap-sm flex-wrap">
                                    {detail.code && <MetaChip label="Code" value={detail.code} />}
                                    {detail.tag && <MetaChip label="TAG" value={detail.tag} />}
                                    <MetaChip label="Level" value={detail.level} />
                                    {detail.plant_id && <MetaChip label="Plant" value={detail.plant_id} />}
                                </div>
                            </div>

                            <div className="tabs" role="tablist">
                                {['general', 'criticality', 'fmea', 'tasks', 'history'].map(t => (
                                    <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {tab === 'general' && (
                                <div>
                                    <div className="grid grid-2" style={{ marginBottom: 16 }}>
                                        <div className="card">
                                            <div className="card-title" style={{ marginBottom: 12 }}>Identification</div>
                                            {detail.metadata && typeof detail.metadata === 'object' ? Object.entries(detail.metadata).map(([k, v]) => (
                                                v && <div key={k} className="flex justify-between" style={{ padding: '6px 0', borderBottom: '1px solid #fafafa', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{k.replace(/_/g, ' ')}</span>
                                                    <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{String(v)}</span>
                                                </div>
                                            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No metadata available</p>}
                                        </div>
                                        <div className="card">
                                            <div className="card-title" style={{ marginBottom: 12 }}>Node Info</div>
                                            <div className="flex justify-between" style={{ padding: '6px 0', borderBottom: '1px solid #fafafa', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Node ID</span>
                                                <span className="mono">{detail.node_id}</span>
                                            </div>
                                            <div className="flex justify-between" style={{ padding: '6px 0', borderBottom: '1px solid #fafafa', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                                                <span>{detail.node_type}</span>
                                            </div>
                                            <div className="flex justify-between" style={{ padding: '6px 0', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>French Name</span>
                                                <span>{detail.name_fr || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tab !== 'general' && <div className="card"><p style={{ color: 'var(--text-muted)' }}>Navigate to the {tab} module for full details</p></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
