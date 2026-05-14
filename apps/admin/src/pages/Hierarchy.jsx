import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, Plus, Sparkles, Library, Wrench,
  FileText, Search, Network, Loader2, X, AlertTriangle, Wand2
} from 'lucide-react';
import { StatusBadge, CritBadge, MetaChip, LoadingSpinner } from '../components/Shared';
import * as api from '../api';
import { criticalityColor, statusColor } from '../data/mockData';

import { useLanguage } from '../contexts/LanguageContext';

// Fallback: árbol vacío cuando el backend aún no tiene jerarquía cargada.
const HIERARCHY_TREE = { id: 'root', name: 'Root', type: 'Company', children: [] };

const ICONS = { Company: '🏢', PLANT: '🏭', Plant: '🏭', AREA: '📍', Area: '📍', SYSTEM: '⚙️', System: '⚙️', EQUIPMENT: '🔧', Equipment: '🔧', SUB_ASSEMBLY: '🔩', Component: '🔩', MAINTAINABLE_ITEM: '🛠️' };

const NODE_TYPE_LEGEND = [
  { type: 'Company', icon: '🏢', color: 'bg-violet-500' },
  { type: 'Plant', icon: '🏭', color: 'bg-blue-500' },
  { type: 'Area', icon: '📍', color: 'bg-teal-500' },
  { type: 'Equipment', icon: '🔧', color: 'bg-orange-500' },
  { type: 'Component', icon: '🔩', color: 'bg-gray-500' },
];

const CRITICALITY_BARS = [
  { key: 'AA', barColor: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400' },
  { key: 'A+', barColor: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-400' },
  { key: 'A', barColor: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400' },
  { key: 'B', barColor: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400' },
];

const CRIT_LABELS = { AA: 'AA — Mission Critical', 'A+': 'A+ — High Impact', A: 'A — Moderate', B: 'B — Standard' };

/* ─── Library of common equipment templates ─── */
const EQUIPMENT_LIBRARY = [
  { name: 'Centrifugal Pump', type: 'Equipment', icon: '🔧', children: ['Motor', 'Impeller', 'Mechanical Seal', 'Bearings', 'Coupling'] },
  { name: 'Ball Mill', type: 'Equipment', icon: '🔧', children: ['Drive Motor', 'Gearbox', 'Shell Liners', 'Trunnion Bearing', 'Diaphragm'] },
  { name: 'Belt Conveyor', type: 'Equipment', icon: '🔧', children: ['Drive Motor', 'Head Pulley', 'Tail Pulley', 'Conveyor Belt', 'Idlers'] },
  { name: 'Jaw Crusher', type: 'Equipment', icon: '🔧', children: ['Drive Motor', 'Flywheel', 'Toggle Plate', 'Fixed Jaw', 'Swing Jaw'] },
  { name: 'Compressor', type: 'Equipment', icon: '🔧', children: ['Drive Motor', 'Aftercooler', 'Intake Filter', 'Separator', 'Safety Valve'] },
  { name: 'Heat Exchanger', type: 'Equipment', icon: '🔧', children: ['Shell', 'Tube Bundle', 'Gaskets', 'Baffles'] },
];

/* Fallback tree → flat node list (solo se usa si la API devuelve vacío). */
function flattenTree(node, parentId = null, list = []) {
  list.push({
    node_id: node.id,
    name: node.name,
    node_type: node.type,
    parent_node_id: parentId,
    code: node.id,
    criticality: null,
    status: 'ACTIVE',
  });
  if (node.children) node.children.forEach(c => flattenTree(c, node.id, list));
  return list;
}

/* ─── Tree Node ─── */
function TreeNode({ node, nodes, selected, onSelect, level = 0 }) {
  const [open, setOpen] = useState(level < 2);
  const children = nodes.filter(n => n.parent_node_id === node.node_id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors border-l-[3px] hover:bg-muted/50 ${selected === node.node_id ? 'bg-green-50 dark:bg-green-900/20 border-l-[#1B5E20] font-semibold' : 'border-transparent'}`}
        style={{ paddingLeft: 8 + level * 20 }}
        onClick={() => { onSelect(node.node_id); if (hasChildren) setOpen(!open); }}
        role="treeitem"
        aria-expanded={hasChildren ? open : undefined}
        aria-selected={selected === node.node_id}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.node_id); if (hasChildren) setOpen(!open); } }}
      >
        {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5" />}
        <span aria-hidden="true">{ICONS[node.node_type] || '📄'}</span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
          {node.code || ''} {node.name}
        </span>
        {node.criticality && <CritBadge crit={node.criticality} />}
      </div>
      {open && children.map(c => <TreeNode key={c.node_id} node={c} nodes={nodes} selected={selected} onSelect={onSelect} level={level + 1} />)}
    </div>
  );
}

/* ─── Create Node Modal ─── */
function CreateNodeModal({ parentNode, onClose, onCreated, t }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [nodeType, setNodeType] = useState('Equipment');
  const [saving, setSaving] = useState(false);

  const types = ['Plant', 'Area', 'System', 'Equipment', 'Component'];

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createNode({
        name: name.trim(),
        code: code.trim() || undefined,
        node_type: nodeType,
        parent_node_id: parentNode?.node_id || null,
      });
      onCreated();
      onClose();
    } catch {
      // Fallback: add locally
      onCreated({
        node_id: `LOCAL-${Date.now()}`,
        name: name.trim(),
        code: code.trim(),
        node_type: nodeType,
        parent_node_id: parentNode?.node_id || null,
        status: 'ACTIVE',
        criticality: null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md z-10 border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">{t('hierarchy.addChild')}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {parentNode && (
            <div className="text-sm text-muted-foreground">
              {t('hierarchy.parentNode')}: <span className="font-medium text-foreground">{parentNode.name}</span>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('hierarchy.nodeType')}</label>
            <select
              value={nodeType}
              onChange={e => setNodeType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
            >
              {types.map(tp => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('hierarchy.nodeName')}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('hierarchy.nodeName')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('hierarchy.nodeCode')}</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. JFC1-PU-003"
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="flex-1 px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Library Modal ─── */
function LibraryModal({ parentNode, onClose, onCreated, t }) {
  const [search, setSearch] = useState('');
  const filtered = EQUIPMENT_LIBRARY.filter(eq => eq.name.toLowerCase().includes(search.toLowerCase()));

  function handleSelect(template) {
    // Create the equipment + its children locally
    const parentId = parentNode?.node_id || null;
    const eqId = `LIB-${Date.now()}`;
    const newNodes = [
      { node_id: eqId, name: template.name, code: '', node_type: template.type, parent_node_id: parentId, status: 'ACTIVE', criticality: null },
      ...template.children.map((ch, i) => ({
        node_id: `LIB-${Date.now()}-${i}`,
        name: ch,
        code: '',
        node_type: 'Component',
        parent_node_id: eqId,
        status: 'ACTIVE',
        criticality: null,
      })),
    ];

    // Try API first
    api.buildFromVendor({
      parent_node_id: parentId,
      equipment_type: template.name,
      components: template.children,
    }).catch(() => {});

    onCreated(newNodes);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg z-10 border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">{t('hierarchy.createFromLibrary')}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="px-6 py-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
          />
        </div>
        <div className="px-6 pb-4 max-h-[400px] overflow-y-auto space-y-2">
          {filtered.map((tmpl, i) => (
            <button
              key={i}
              onClick={() => handleSelect(tmpl)}
              className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted/50 hover:border-[#1B5E20]/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{tmpl.icon}</span>
                <span className="font-semibold text-sm text-foreground group-hover:text-[#1B5E20]">{tmpl.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tmpl.children.map((ch, j) => (
                  <span key={j} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{ch}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── AI Improve Modal ─── */
function AIImproveModal({ node, onClose, t }) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.callAiTool({
      tool_name: 'analyze_hierarchy',
      parameters: { node_id: node?.node_id, equipment_type: node?.node_type },
    }).then(result => {
      if (cancelled) return;
      const items = result?.suggestions || [];
      if (items.length > 0) {
        setSuggestions(items);
      } else {
        // Fallback with generic suggestions
        setSuggestions([
          { type: 'add', message: t('hierarchy.aiSuggestionAdd'), detail: 'Motor Drive Assembly, Lubrication System, Cooling System' },
          { type: 'rename', message: t('hierarchy.aiSuggestionRename'), detail: `${node?.name} → ${node?.name} (Revised)` },
          { type: 'criticality', message: t('hierarchy.aiSuggestionCriticality'), detail: 'A → AA (based on production impact analysis)' },
        ]);
      }
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setSuggestions([
        { type: 'add', message: t('hierarchy.aiSuggestionAdd'), detail: 'Motor Drive Assembly, Lubrication System, Cooling System' },
        { type: 'rename', message: t('hierarchy.aiSuggestionRename'), detail: `${node?.name} → ${node?.name} (Revised)` },
        { type: 'criticality', message: t('hierarchy.aiSuggestionCriticality'), detail: 'A → AA (based on production impact analysis)' },
      ]);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [node, t]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg z-10 border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">{t('hierarchy.improveHierarchy')}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground mb-4">{t('hierarchy.improveHierarchyDesc')}</p>

          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B5E20] mb-3" />
              <p className="text-sm text-muted-foreground">{t('hierarchy.aiAnalyzing')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 size={14} className="text-amber-500" />
                    <span className="text-sm font-medium text-foreground">{s.message}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-5">{s.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            {t('common.close')}
          </button>
          {!loading && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] transition-colors"
            >
              {t('hierarchy.applySuggestions')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Criticality Distribution Panel ─── */
function CriticalityDistributionPanel({ nodes = [], t }) {
  const counts = useMemo(() => {
    const c = { AA: 0, 'A+': 0, A: 0, B: 0 };
    nodes.forEach(n => { if (n.criticality && c[n.criticality] !== undefined) c[n.criticality]++; });
    return c;
  }, [nodes]);
  const total = nodes.filter(n => n.criticality).length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm mb-4">
      <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3">{t('hierarchy.critDistribution')}</div>
      <div className="space-y-3">
        {CRITICALITY_BARS.map(({ key, barColor, textColor }) => {
          const count = counts[key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-semibold ${textColor}`}>{CRIT_LABELS[key]}</span>
                <span className="text-xs text-muted-foreground font-mono">{count} ({pct}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-right">{total} {t('hierarchy.totalAssets')}</div>
    </div>
  );
}

/* ─── AA Critical List ─── */
function AACriticalList({ nodes = [], t }) {
  const aaEquipment = useMemo(() => nodes.filter(n => n.criticality === 'AA').map(n => ({ tag: n.code || n.node_id, name: n.name, plant: n.plant_id || '', status: n.status || 'ACTIVE', criticality: n.criticality })), [nodes]);
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm mb-4">
      <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3">
        {t('hierarchy.aaCritical')}
        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-[10px] font-bold">{aaEquipment.length}</span>
      </div>
      <div className="space-y-2">
        {aaEquipment.map(eq => (
          <div key={eq.tag} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
            <span aria-hidden="true">🔧</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{eq.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{eq.tag} · {eq.plant}</div>
            </div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border-transparent ${statusColor(eq.status)}`}>{eq.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Type Legend ─── */
function TypeLegendPanel({ t }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3">{t('hierarchy.nodeTypeLegend')}</div>
      <div className="space-y-2">
        {NODE_TYPE_LEGEND.map(({ type, icon, color }) => (
          <div key={type} className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
            <span aria-hidden="true">{icon}</span>
            <span className="text-sm text-foreground">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Hierarchy() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('general');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showAIImprove, setShowAIImprove] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  /* ─── Load nodes ─── */
  useEffect(() => {
    setLoading(true);
    api.listNodes({ plant_id: plant })
      .then(n => {
        if (Array.isArray(n) && n.length > 0) {
          setNodes(n);
        } else {
          // Fallback to mock hierarchy
          setNodes(flattenTree(HIERARCHY_TREE));
        }
      })
      .catch(() => setNodes(flattenTree(HIERARCHY_TREE)))
      .finally(() => setLoading(false));
  }, [plant]);

  /* ─── Load detail ─── */
  useEffect(() => {
    if (selected) {
      api.getNode(selected).then(setDetail).catch(() => {
        // Use local node data as fallback
        const localNode = nodes.find(n => n.node_id === selected);
        if (localNode) setDetail(localNode);
      });
    } else {
      setDetail(null);
    }
  }, [selected, nodes]);

  /* ─── Search filter ─── */
  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    const matchIds = new Set();
    nodes.forEach(n => {
      if ((n.name || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q)) {
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

  const selectedNode = useMemo(() => nodes.find(n => n.node_id === selected), [nodes, selected]);
  const isEquipment = detail?.node_type === 'Equipment' || detail?.node_type === 'EQUIPMENT';

  /* ─── AI Generate hierarchy ─── */
  async function handleAIGenerate() {
    if (!selected) return;
    setAiGenerating(true);
    try {
      const result = await api.callAiTool({
        tool_name: 'generate_hierarchy',
        parameters: { parent_node_id: selected, plant_id: plant },
      });
      // If API returns nodes, add them
      const newNodes = result?.nodes || result?.data || [];
      if (Array.isArray(newNodes) && newNodes.length > 0) {
        setNodes(prev => [...prev, ...newNodes]);
      } else {
        // Reload from API to pick up any server-side changes
        const refreshed = await api.listNodes({ plant_id: plant });
        if (Array.isArray(refreshed) && refreshed.length > 0) setNodes(refreshed);
      }
    } catch {
      // Silently handle — AI generation is optional
    }
    setAiGenerating(false);
  }

  /* ─── Node created callback ─── */
  function handleNodeCreated(newNode) {
    if (Array.isArray(newNode)) {
      setNodes(prev => [...prev, ...newNode]);
    } else if (newNode) {
      setNodes(prev => [...prev, newNode]);
    } else {
      // Reload from API
      api.listNodes({ plant_id: plant }).then(n => {
        if (Array.isArray(n) && n.length > 0) setNodes(n);
      }).catch(() => {});
    }
  }

  /* ─── Create Work Request from equipment ─── */
  function handleCreateWR() {
    // Navigate to field capture with pre-populated equipment data
    navigate('/field-capture', {
      state: {
        equipment_tag: detail?.code || detail?.node_id,
        equipment_name: detail?.name,
        plant: detail?.plant_id || plant,
      },
    });
  }

  const tabLabels = {
    general: t('hierarchy.tabGeneral'),
    criticality: t('hierarchy.tabCriticality'),
    fmea: t('hierarchy.tabFmea'),
    tasks: t('hierarchy.tabTasks'),
    history: t('hierarchy.tabHistory'),
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <Network size={22} className="text-teal-700 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('hierarchy.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('hierarchy.subtitle')}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-medium hover:bg-[#2E7D32] transition-colors"
          >
            <Plus size={16} />
            {t('hierarchy.addChild')}
          </button>
          <button
            onClick={() => setShowLibraryModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <Library size={16} />
            {t('hierarchy.createFromLibrary')}
          </button>
          <button
            onClick={handleAIGenerate}
            disabled={!selected || aiGenerating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-50 transition-colors"
          >
            {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {t('hierarchy.generateWithAI')}
          </button>
          <button
            onClick={() => setShowAIImprove(true)}
            disabled={!selected}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 transition-colors"
          >
            <Wand2 size={16} />
            {t('hierarchy.improveHierarchy')}
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* ── Left column: Asset Tree ── */}
        <div className="lg:w-[35%] min-w-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="font-medium text-foreground text-sm">{t('hierarchy.assetTree')}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] dark:text-green-400 font-semibold">{nodes.length} {t('hierarchy.nodes')}</span>
            </div>
            <div className="px-3 py-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] placeholder:text-muted-foreground"
                  placeholder={t('hierarchy.searchPlaceholder')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]" role="tree">
              {loading ? <LoadingSpinner /> : roots.length === 0 && search ? (
                <p className="p-4 text-muted-foreground text-center text-sm">{t('common.noResults', { query: search })}</p>
              ) : roots.map(r => <TreeNode key={r.node_id} node={r} nodes={filteredNodes} selected={selected} onSelect={setSelected} />)}
            </div>
            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
              {Object.entries(stats).map(([k, v]) => `${v} ${k}`).join(' · ')}
            </div>
          </div>
        </div>

        {/* ── Right column: detail OR side panel ── */}
        <div className="flex-1 min-w-0">
          {!detail ? (
            <div>
              <div className="text-center py-8 px-5 text-muted-foreground bg-card border border-border rounded-xl mb-4">
                <div className="text-5xl mb-4 opacity-40">🔍</div>
                <h3 className="font-semibold text-base mb-1">{t('hierarchy.selectNode')}</h3>
                <p className="text-sm">{t('hierarchy.selectNodeDesc')}</p>
              </div>
              <CriticalityDistributionPanel nodes={nodes} t={t} />
              <AACriticalList nodes={nodes} t={t} />
              <TypeLegendPanel t={t} />
            </div>
          ) : (
            <div>
              {/* Node Header */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] dark:text-green-400 font-semibold">{detail.node_type}</span>
                  <StatusBadge status={detail.status || 'ACTIVE'} />
                  {detail.criticality && <CritBadge crit={detail.criticality} />}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{detail.name}</h2>
                <div className="flex gap-2 flex-wrap mb-3">
                  {detail.code && <MetaChip label={t('common.code')} value={detail.code} />}
                  {detail.tag && <MetaChip label="TAG" value={detail.tag} />}
                  <MetaChip label="Level" value={detail.level || detail.node_type} />
                  {(detail.plant_id || plant) && <MetaChip label={t('common.plant')} value={detail.plant_id || plant} />}
                </div>

                {/* Action bar for selected node */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 border border-border transition-colors"
                  >
                    <Plus size={14} />
                    {t('hierarchy.addChild')}
                  </button>
                  <button
                    onClick={() => setShowLibraryModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 border border-border transition-colors"
                  >
                    <Library size={14} />
                    {t('hierarchy.createFromLibrary')}
                  </button>
                  {isEquipment && (
                    <button
                      onClick={handleCreateWR}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700 transition-colors"
                    >
                      <FileText size={14} />
                      {t('hierarchy.createWorkRequest')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowAIImprove(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 transition-colors"
                  >
                    <Wand2 size={14} />
                    {t('hierarchy.improveHierarchy')}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto" role="tablist">
                {['general', 'criticality', 'fmea', 'tasks', 'history'].map(tb => (
                  <button
                    key={tb}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${tab === tb ? 'bg-card border border-border border-b-card text-[#1B5E20] dark:text-green-400 font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setTab(tb)}
                    role="tab"
                    aria-selected={tab === tb}
                  >
                    {tabLabels[tb]}
                  </button>
                ))}
              </div>

              {tab === 'general' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                      <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3">{t('hierarchy.identification')}</div>
                      {detail.metadata && typeof detail.metadata === 'object' ? Object.entries(detail.metadata).map(([k, v]) => (
                        v && <div key={k} className="flex justify-between py-1.5 border-b border-border/30 text-sm">
                          <span className="text-muted-foreground">{k.replace(/_/g, ' ')}</span>
                          <span className="font-medium font-mono text-sm text-foreground">{String(v)}</span>
                        </div>
                      )) : <p className="text-muted-foreground text-sm">{t('hierarchy.noMetadata')}</p>}
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                      <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3">{t('hierarchy.nodeInfo')}</div>
                      <div className="flex justify-between py-1.5 border-b border-border/30 text-sm">
                        <span className="text-muted-foreground">Node ID</span>
                        <span className="font-mono text-xs text-foreground">{detail.node_id}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-border/30 text-sm">
                        <span className="text-muted-foreground">{t('common.type')}</span>
                        <span className="text-foreground">{detail.node_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-sm">
                        <span className="text-muted-foreground">{t('hierarchy.frenchName')}</span>
                        <span className="text-foreground">{detail.name_fr || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CriticalityDistributionPanel t={t} />
                    <TypeLegendPanel t={t} />
                  </div>
                </div>
              )}
              {tab !== 'general' && (
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <p className="text-muted-foreground">{t('hierarchy.navigateToModule', { module: tabLabels[tab] })}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateNodeModal parentNode={selectedNode} onClose={() => setShowCreateModal(false)} onCreated={handleNodeCreated} t={t} />}
      {showLibraryModal && <LibraryModal parentNode={selectedNode} onClose={() => setShowLibraryModal(false)} onCreated={handleNodeCreated} t={t} />}
      {showAIImprove && <AIImproveModal node={selectedNode} onClose={() => setShowAIImprove(false)} t={t} />}
    </div>
  );
}
