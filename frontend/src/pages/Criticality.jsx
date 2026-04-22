import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CritBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { criticalityColor } from '../data/mockData';

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Gauge, Sparkles, Loader2, CheckCircle, Activity, Shield,
  TrendingUp, TrendingDown, Minus, Search, Heart, Save
} from 'lucide-react';

const CLASS_DOT_COLOR = { AA: '#dc2626', 'A+': '#ea580c', A: '#ca8a04', B: '#2563eb' };
// 6 categorías mapeadas a CriticalityCategory del engine (de 11 disponibles).
const FACTORS = [
  { key: 'production_impact',   category: 'PRODUCTION',    label: 'Prod',   color: '#3b82f6', desc: 'Impacto en producción' },
  { key: 'safety_risk',         category: 'SAFETY',        label: 'Safety', color: '#ef4444', desc: 'Riesgo de seguridad' },
  { key: 'environmental_risk',  category: 'ENVIRONMENT',   label: 'Env',    color: '#22c55e', desc: 'Riesgo ambiental' },
  { key: 'maintenance_cost',    category: 'OPERATING_COST', label: 'Cost',   color: '#f59e0b', desc: 'Costo operativo' },
  { key: 'availability_impact', category: 'SCHEDULE',      label: 'Avail',  color: '#8b5cf6', desc: 'Impacto en disponibilidad' },
  { key: 'regulatory',          category: 'COMPLIANCE',    label: 'Reg',    color: '#06b6d4', desc: 'Cumplimiento regulatorio' },
];
const FACTOR_KEYS = FACTORS.map(f => f.key);
const FACTOR_LABELS = FACTORS.map(f => f.label);
const FACTOR_BAR_COLORS = FACTORS.map(f => f.color);

const RISK_TO_LETTER = { I_LOW: 'B', II_MEDIUM: 'A', III_HIGH: 'A+', IV_CRITICAL: 'AA' };

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
function CriticalityTab({ nodes, t, assessments, reload }) {
  const toast = useToast();
  const [selectedNode, setSelectedNode] = useState('');
  const [assessing, setAssessing] = useState(false);
  const [result, setResult] = useState(null);
  // Matriz 6S + probabilidad (1-5)
  const [scores, setScores] = useState(() => FACTORS.reduce((acc, f) => ({ ...acc, [f.key]: 3 }), {}));
  const [probability, setProbability] = useState(3);

  // Index assessments by node_id for quick lookup
  const assessmentByNode = useMemo(() => {
    const map = {};
    (assessments || []).forEach(a => { if (a.node_id) map[a.node_id] = a; });
    return map;
  }, [assessments]);

  // Solo nodos con UNA evaluación real (no el default seed n.criticality).
  const assessed = nodes
    .map(n => ({ ...n, __assessment: assessmentByNode[n.node_id] }))
    .filter(n => n.__assessment && n.__assessment.letter);
  const aaCount = assessed.filter(n => n.__assessment.letter === 'AA').length;
  const modCount = assessed.filter(n => n.__assessment.letter === 'A+' || n.__assessment.letter === 'A').length;
  const bCount = assessed.filter(n => n.__assessment.letter === 'B').length;
  const pendingCount = nodes.length - assessed.length;
  const total = assessed.length;

  const scatterData = useMemo(() => assessed.map(n => {
    const a = n.__assessment;
    const scoreFor = (cat) => a?.criteria_scores?.find?.(s => s.category === cat)?.consequence_level ?? 0;
    const row = {
      equipment_name: n.name, equipment_tag: n.code || n.node_id,
      class: a.letter,
      total_score: Math.round(a?.overall_score || 0),
    };
    FACTORS.forEach(f => { row[f.key] = scoreFor(f.category); });
    return row;
  }), [assessed]);
  const sorted = useMemo(() => [...scatterData].sort((a, b) => b.total_score - a.total_score), [scatterData]);

  async function handleAssess() {
    if (!selectedNode) return;
    setAssessing(true);
    setResult(null);
    try {
      const payload = {
        node_id: selectedNode,
        probability: Number(probability),
        method: 'FULL_MATRIX',
        assessed_by: 'user',
        criteria_scores: FACTORS.map(f => ({
          category: f.category,
          consequence_level: Number(scores[f.key]) || 1,
        })),
      };
      const res = await api.assessCriticality(payload);
      setResult({
        ...res,
        criticality_id: res.assessment_id,
        new_criticality: RISK_TO_LETTER[res.risk_class] || res.risk_class,
        scores: FACTORS.reduce((acc, f, i) => ({ ...acc, [f.key]: Number(scores[f.key]) }), { total: res.overall_score }),
        justification: `Evaluación manual 6S completada. Score total ${res.overall_score} (max consecuencia × probabilidad=${probability}) → clase ${RISK_TO_LETTER[res.risk_class] || res.risk_class}.`,
      });
      toast.success(t('criticality.assessmentComplete'));
      reload();
    } catch (e) {
      toast.error('Error: ' + (e?.message || e));
    } finally {
      setAssessing(false);
    }
  }

  async function handleApprove() {
    if (!result?.criticality_id) return;
    try {
      await api.approveCriticality(result.criticality_id);
      setResult(prev => ({ ...prev, status: 'APPROVED' }));
      toast.success(t('criticality.approved'));
      reload();
    } catch (e) {
      toast.error('Error: ' + (e?.message || e));
    }
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('criticality.high'), sub: 'AA', count: aaCount, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', barColor: '#dc2626' },
          { label: t('criticality.moderate'), sub: 'A+ / A', count: modCount, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', barColor: '#f59e0b' },
          { label: t('criticality.low'), sub: 'B', count: bCount, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', barColor: '#2563eb' },
          { label: 'Sin evaluar', sub: `de ${nodes.length} equipos`, count: pendingCount, bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800', text: 'text-gray-700 dark:text-gray-300', barColor: '#6b7280' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
            <div className={`text-3xl font-extrabold ${c.text}`}>{c.count}</div>
            <div className={`text-sm font-semibold ${c.text}`}>{c.label}</div>
            <div className="text-[0.7rem] text-muted-foreground">{c.sub}</div>
            <div className="mt-1 w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-1.5 rounded-full" style={{ width: `${nodes.length > 0 ? Math.min(100, Math.round((c.count / nodes.length) * 100)) : 0}%`, backgroundColor: c.barColor }} />
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

      {/* 6-Category Manual Assessment */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-orange-500" />
          <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">Evaluación 6S · Consecuencia × Probabilidad</div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Califica cada categoría (1–5) y la probabilidad de falla. Score = max(consecuencia) × probabilidad. Clase: IV→AA, III→A+, II→A, I→B.
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <select
            className="w-[300px] px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20]"
            value={selectedNode}
            onChange={e => setSelectedNode(e.target.value)}
          >
            <option value="">{t('criticality.selectEquipment')}</option>
            {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || n.node_id} — {n.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {FACTORS.map(f => (
            <div key={f.key} className="bg-muted/30 border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">{f.desc}</label>
                <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: f.color }}>{scores[f.key]}</span>
              </div>
              <input type="range" min="1" max="5" step="1"
                value={scores[f.key]}
                onChange={e => setScores(s => ({ ...s, [f.key]: Number(e.target.value) }))}
                className="w-full" />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                <span>1 bajo</span><span>3 medio</span><span>5 severo</span>
              </div>
            </div>
          ))}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-amber-900 dark:text-amber-300">Probabilidad de falla</label>
              <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-amber-600 text-white">{probability}</span>
            </div>
            <input type="range" min="1" max="5" step="1"
              value={probability}
              onChange={e => setProbability(Number(e.target.value))}
              className="w-full accent-amber-600" />
            <div className="flex justify-between text-[9px] text-amber-700 dark:text-amber-400 mt-0.5">
              <span>1 rara</span><span>3 ocasional</span><span>5 frecuente</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <span className="text-sm text-indigo-900 dark:text-indigo-300">
            Score previsto: <strong className="text-lg tabular-nums">{Math.max(...Object.values(scores)) * probability}</strong>
            {' '}· Clase estimada: <strong>{(() => {
              const s = Math.max(...Object.values(scores)) * probability;
              if (s >= 17) return 'AA';
              if (s >= 10) return 'A+';
              if (s >= 5) return 'A';
              return 'B';
            })()}</strong>
          </span>
          <button
            onClick={handleAssess}
            disabled={assessing || !selectedNode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
          >
            {assessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {assessing ? 'Evaluando…' : 'Evaluar y guardar'}
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
function AssetHealthTab({ t, plant }) {
  const [search, setSearch] = useState('');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAssetHealth({ plant_id: plant })
      .then(d => {
        const arr = d?.assets ?? (Array.isArray(d) ? d : []);
        setRawData(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setRawData([]))
      .finally(() => setLoading(false));
  }, [plant]);

  const healthData = useMemo(() => {
    return rawData.map(kpi => {
      const healthScore = kpi.health_score != null
        ? Math.round(kpi.health_score)
        : Math.round(((kpi.availability || 0) * 0.3 + (kpi.oee || 0) * 0.3 + Math.min((kpi.mtbf || 0) / 20, 100) * 0.4));
      const healthColor = healthScore >= 85 ? 'text-green-600 dark:text-green-400' : healthScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
      const healthBg = healthScore >= 85 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : healthScore >= 70 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      return { ...kpi, healthScore, healthColor, healthBg };
    }).sort((a, b) => a.healthScore - b.healthScore);
  }, [rawData]);

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
      {loading ? (
        <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          Sin datos de health score. Se mostrarán equipos cuando haya KPIs calculados.
        </p>
      ) : null}
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
  const [assessments, setAssessments] = useState([]);

  const reload = () => {
    api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' })
      .then(n => setNodes(Array.isArray(n) ? n : []))
      .catch(() => setNodes([]));
    api.listCriticalityByPlant(plant)
      .then(a => setAssessments(Array.isArray(a) ? a : []))
      .catch(() => setAssessments([]));
  };

  useEffect(() => { reload(); }, [plant]);

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

      {activeTab === 'criticality' && <CriticalityTab nodes={nodes} t={t} assessments={assessments} reload={reload} />}
      {activeTab === 'health' && <AssetHealthTab t={t} plant={plant} />}
    </div>
  );
}
