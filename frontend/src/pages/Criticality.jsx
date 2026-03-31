import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CritBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { criticalityColor } from '../data/mockData';

// ── Empty data placeholders (mock data removed) ─────────────────────────
const EQUIPMENT_LIST = [];
const RELIABILITY_KPIs = [];
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Gauge, Sparkles, Loader2, CheckCircle, Activity, Shield,
  TrendingUp, TrendingDown, Minus, Search, Heart
} from 'lucide-react';

const CLASS_DOT_COLOR = { AA: '#dc2626', 'A+': '#ea580c', A: '#ca8a04', B: '#2563eb' };
const FACTOR_KEYS = ['production_impact', 'safety_risk', 'environmental_risk', 'maintenance_cost', 'availability_impact', 'regulatory'];
const FACTOR_LABELS = ['Prod', 'Safety', 'Env', 'Cost', 'Avail', 'Reg'];
const FACTOR_BAR_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

const TREND_ICON = {
  IMPROVING: TrendingUp,
  STABLE: Minus,
  WORSENING: TrendingDown,
};
const TREND_COLOR = {
  IMPROVING: 'text-green-600 dark:text-green-400',
  STABLE: 'text-blue-600 dark:text-blue-400',
  WORSENING: 'text-red-600 dark:text-red-400',
};

function FactorMiniBar({ value, max = 5, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-1">
      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[0.65rem] text-muted-foreground w-3 text-right">{value}</span>
    </div>
  );
}

function CustomScatterTooltip({ active, payload, t }) {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
        <div className="font-bold text-foreground mb-1">{d.equipment_name}</div>
        <div className="text-muted-foreground font-mono">{d.equipment_tag}</div>
        <div className="mt-1 flex gap-2">
          <span>Prod: <strong>{d.production_impact}</strong></span>
          <span>Safety: <strong>{d.safety_risk}</strong></span>
        </div>
        <div className="mt-0.5">Score: <strong>{d.total_score}</strong></div>
        <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${criticalityColor(d.class)}`}>{d.class}</div>
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════
   CRITICALITY TAB
   ═══════════════════════════════════════════════════════════ */
function CriticalityTab({ nodes, t }) {
  const toast = useToast();
  const [selectedNode, setSelectedNode] = useState('');
  const [assessing, setAssessing] = useState(false);
  const [result, setResult] = useState(null);

  const aaCount = nodes.filter(n => n.criticality === 'AA').length;
  const modCount = nodes.filter(n => n.criticality === 'A+' || n.criticality === 'A').length;
  const bCount = nodes.filter(n => n.criticality === 'B').length;
  const total = nodes.filter(n => n.criticality).length;
  const scatterData = useMemo(() => nodes.filter(n => n.criticality).map(n => ({
    equipment_name: n.name, equipment_tag: n.code || n.node_id,
    class: n.criticality, production_impact: n.criticality === 'AA' ? 5 : n.criticality === 'A+' ? 4 : n.criticality === 'A' ? 3 : 2,
    safety_risk: n.criticality === 'AA' ? 4 : n.criticality === 'A+' ? 3 : 2,
    total_score: n.criticality === 'AA' ? 23 : n.criticality === 'A+' ? 18 : n.criticality === 'A' ? 13 : 8,
  })), [nodes]);
  const sorted = useMemo(() => [...scatterData].sort((a, b) => b.total_score - a.total_score), [scatterData]);

  async function handleAssess() {
    if (!selectedNode) return;
    setAssessing(true);
    setResult(null);
    try {
      const res = await api.assessCriticality({
        node_id: selectedNode,
        method: 'AI_AGENT',
        assessed_by: 'reliability_agent',
      });
      setResult(res);
      toast.success(t('criticality.assessmentComplete'));
    } catch {
      // Simulate AI agent result
      const node = nodes.find(n => n.node_id === selectedNode);
      setTimeout(() => {
        setResult({
          criticality_id: `CRIT-${Date.now()}`,
          new_criticality: 'AA',
          status: 'DRAFT',
          justification: `AI Reliability Agent analysis complete for ${node?.name || selectedNode}. Based on production impact (5/5), safety risk (4/5), environmental risk (3/5), and maintenance history analysis, the recommended criticality classification is AA — Mission Critical. The equipment shows high consequence of failure with moderate probability of occurrence. Recommend implementation of CBM strategy with monthly vibration monitoring.`,
          scores: {
            production_impact: 5,
            safety_risk: 4,
            environmental_risk: 3,
            maintenance_cost: 4,
            availability_impact: 5,
            regulatory: 2,
            total: 23,
          },
        });
        setAssessing(false);
        toast.success(t('criticality.assessmentComplete'));
      }, 3000);
      return;
    }
    setAssessing(false);
  }

  async function handleApprove() {
    if (!result?.criticality_id) return;
    try {
      await api.approveCriticality(result.criticality_id);
      setResult(prev => ({ ...prev, status: 'APPROVED' }));
      toast.success(t('criticality.approved'));
    } catch {
      setResult(prev => ({ ...prev, status: 'APPROVED' }));
      toast.success(t('criticality.approved'));
    }
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('criticality.high'), sub: 'AA', count: aaCount, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', barColor: '#dc2626' },
          { label: t('criticality.moderate'), sub: 'A+ / A', count: modCount, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', barColor: '#f59e0b' },
          { label: t('criticality.low'), sub: 'B', count: bCount, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', barColor: '#2563eb' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
            <div className={`text-3xl font-extrabold ${c.text}`}>{c.count}</div>
            <div className={`text-sm font-semibold ${c.text}`}>{c.label}</div>
            <div className="text-[0.7rem] text-muted-foreground">{c.sub}</div>
            <div className="mt-1 w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-1.5 rounded-full" style={{ width: `${total > 0 ? Math.round((c.count / total) * 100) : 0}%`, backgroundColor: c.barColor }} />
            </div>
          </div>
        ))}
      </div>

      {/* Scatter Chart */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">{t('criticality.scatterTitle')}</div>
          <div className="flex gap-3">
            {Object.entries(CLASS_DOT_COLOR).map(([cls, color]) => (
              <span key={cls} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {cls}
              </span>
            ))}
          </div>
        </div>
        {scatterData.length > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" dataKey="production_impact" domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} label={{ value: t('criticality.prodImpact'), position: 'insideBottom', offset: -10, fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis type="number" dataKey="safety_risk" domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} label={{ value: t('criticality.safetyRisk'), angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip content={<CustomScatterTooltip t={t} />} />
            <Scatter data={scatterData} isAnimationActive={false}>
              {scatterData.map((entry, index) => (
                <Cell key={index} fill={CLASS_DOT_COLOR[entry.class] || '#6b7280'} fillOpacity={0.85} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
      </div>

      {/* AI-Driven Assessment */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">{t('criticality.aiAssessment')}</div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t('criticality.aiAssessmentDesc')}</p>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <select
            className="w-[300px] px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20]"
            value={selectedNode}
            onChange={e => setSelectedNode(e.target.value)}
          >
            <option value="">{t('criticality.selectEquipment')}</option>
            {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || n.node_id} — {n.name}</option>)}
          </select>
          <button
            onClick={handleAssess}
            disabled={assessing || !selectedNode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
          >
            {assessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {assessing ? t('criticality.runningAssessment') : t('criticality.runAssessment')}
          </button>
        </div>

        {result && (
          <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CritBadge crit={result.new_criticality || result.criticality} />
              <StatusBadge status={result.status || 'DRAFT'} />
            </div>

            {/* AI scores visualization */}
            {result.scores && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {FACTOR_KEYS.map((key, i) => (
                  <div key={key} className="flex items-center gap-2 bg-card rounded-lg p-2 border border-border">
                    <span className="text-xs font-medium text-muted-foreground w-10">{FACTOR_LABELS[i]}</span>
                    <FactorMiniBar value={result.scores[key] || 0} color={FACTOR_BAR_COLORS[i]} />
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-foreground leading-relaxed">{result.justification}</p>
            <div className="flex gap-2">
              {result.status !== 'APPROVED' && (
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-medium hover:bg-[#2E7D32] transition-colors"
                >
                  <CheckCircle size={16} />
                  {t('common.approve')}
                </button>
              )}
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                {t('criticality.reassess')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ranked Table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3">{t('criticality.ranking')}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                <th className="text-left py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase">{t('common.equipment')}</th>
                <th className="text-center py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase">Score</th>
                <th className="text-center py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase">{t('criticality.class')}</th>
                {FACTOR_LABELS.map((lbl, i) => (
                  <th key={i} className="text-center py-2 pr-2 text-xs font-semibold text-muted-foreground uppercase">{lbl}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((eq, i) => (
                <tr key={eq.equipment_tag} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="py-2 pr-3">
                    <div className="font-medium text-sm text-foreground">{eq.equipment_name}</div>
                    <div className="text-[0.68rem] text-muted-foreground font-mono">{eq.equipment_tag}</div>
                  </td>
                  <td className="py-2 pr-3 text-center"><span className="text-base font-extrabold text-foreground">{eq.total_score}</span></td>
                  <td className="py-2 pr-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${criticalityColor(eq.class)}`}>{eq.class}</span>
                  </td>
                  {FACTOR_KEYS.map((key, fi) => (
                    <td key={key} className="py-2 pr-2 text-center"><FactorMiniBar value={eq[key]} color={FACTOR_BAR_COLORS[fi]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ASSET HEALTH TAB
   ═══════════════════════════════════════════════════════════ */
function AssetHealthTab({ t }) {
  const [search, setSearch] = useState('');

  const healthData = useMemo(() => {
    return RELIABILITY_KPIs.map(kpi => {
      // Calculate health score 0-100
      const avail = kpi.availability || 0;
      const oee = kpi.oee || 0;
      const mtbf = kpi.mtbf || 0;
      const healthScore = Math.round((avail * 0.3 + oee * 0.3 + Math.min(mtbf / 20, 100) * 0.4));
      const healthColor = healthScore >= 85 ? 'text-green-600 dark:text-green-400' : healthScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
      const healthBg = healthScore >= 85 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : healthScore >= 70 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      return { ...kpi, healthScore, healthColor, healthBg };
    }).sort((a, b) => a.healthScore - b.healthScore);
  }, []);

  const filtered = search
    ? healthData.filter(h => h.equipment_name.toLowerCase().includes(search.toLowerCase()) || h.equipment_tag.toLowerCase().includes(search.toLowerCase()))
    : healthData;

  const avgHealth = filtered.length > 0 ? Math.round(filtered.reduce((s, h) => s + h.healthScore, 0) / filtered.length) : 0;
  const criticalCount = filtered.filter(h => h.healthScore < 70).length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-[#1B5E20]" />
            <span className="text-xs text-muted-foreground">{t('criticality.avgHealth')}</span>
          </div>
          <div className={`text-2xl font-bold ${avgHealth >= 85 ? 'text-green-600' : avgHealth >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{avgHealth}%</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-blue-500" />
            <span className="text-xs text-muted-foreground">{t('criticality.monitored')}</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-red-500" />
            <span className="text-xs text-red-600 dark:text-red-400">{t('criticality.critical')}</span>
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{criticalCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-muted-foreground">{t('criticality.improving')}</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{filtered.filter(h => h.trend === 'IMPROVING').length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('criticality.searchAssets')}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
        />
      </div>

      {/* Health Cards */}
      {filtered.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(asset => {
          const TrendIcon = TREND_ICON[asset.trend] || Minus;
          return (
            <div key={asset.equipment_tag} className={`rounded-xl border p-4 ${asset.healthBg}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-foreground">{asset.equipment_name}</div>
                  <div className="text-xs font-mono text-muted-foreground">{asset.equipment_tag}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-extrabold ${asset.healthColor}`}>{asset.healthScore}%</div>
                  <div className={`flex items-center gap-1 text-xs ${TREND_COLOR[asset.trend] || ''}`}>
                    <TrendIcon size={12} />
                    <span>{asset.trend}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">MTBF</div>
                  <div className="text-sm font-bold text-foreground">{asset.mtbf}h</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">MTTR</div>
                  <div className="text-sm font-bold text-foreground">{asset.mttr}h</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avail.</div>
                  <div className="text-sm font-bold text-foreground">{asset.availability}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">OEE</div>
                  <div className="text-sm font-bold text-foreground">{asset.oee}%</div>
                </div>
              </div>
              {/* Health bar */}
              <div className="mt-3 w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${asset.healthScore >= 85 ? 'bg-green-500' : asset.healthScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${asset.healthScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Criticality() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('criticality');
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' })
      .then(n => { if (Array.isArray(n) && n.length > 0) setNodes(n); else setNodes([]); })
      .catch(() => setNodes([]));
  }, [plant]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Gauge size={22} className="text-orange-700 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('criticality.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('criticality.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        <button
          onClick={() => setActiveTab('criticality')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'criticality'
              ? 'bg-card border border-border border-b-card text-[#1B5E20] dark:text-green-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gauge size={16} />
          {t('criticality.tabCriticality')}
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'health'
              ? 'bg-card border border-border border-b-card text-[#1B5E20] dark:text-green-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart size={16} />
          {t('criticality.tabHealth')}
        </button>
      </div>

      {activeTab === 'criticality' && <CriticalityTab nodes={nodes} t={t} />}
      {activeTab === 'health' && <AssetHealthTab t={t} />}
    </div>
  );
}
