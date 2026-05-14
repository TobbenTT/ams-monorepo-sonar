import { useState } from 'react';
import { Brain, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import * as api from '../api';

const CONFIDENCE_COLORS = {
  high:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  low:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
};

const STRATEGY_COLORS = {
  CBM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  TBM: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  RTF: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  FTM: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
};

export default function RCMAdvisorPanel({ equipmentTag, plantId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const handleAnalyze = async () => {
    if (!equipmentTag) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.adviseRCMStrategy({
        equipment_tag: equipmentTag,
        plant_id: plantId || 'OCP-JFC1',
      });
      setResult(res.data || res);
    } catch (err) {
      console.error('RCM Advisor error:', err);
      setError(err.message || 'Error al analizar');
    } finally {
      setLoading(false);
    }
  };

  const summary = result?.strategy_summary || {};
  const strategies = result?.strategies || [];
  const confidence = result?.overall_confidence || 'medium';
  const confLevel = typeof confidence === 'number'
    ? (confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low')
    : confidence;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-foreground">RCM Advisor</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Analyze button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !equipmentTag}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              Analizar
            </button>
            {!equipmentTag && (
              <span className="text-xs text-muted-foreground">Seleccione un equipo primero</span>
            )}
            {equipmentTag && !result && !loading && (
              <span className="text-xs text-muted-foreground">Equipo: {equipmentTag}</span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Confidence badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Confianza:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${CONFIDENCE_COLORS[confLevel] || CONFIDENCE_COLORS.medium}`}>
                  {typeof confidence === 'number' ? `${Math.round(confidence * 100)}%` : confLevel.toUpperCase()}
                </span>
              </div>

              {/* Strategy summary cards */}
              {Object.keys(summary).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(summary).map(([key, count]) => (
                    <div key={key} className={`rounded-lg px-3 py-2 text-center ${STRATEGY_COLORS[key] || 'bg-muted text-muted-foreground'}`}>
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-[0.65rem] font-semibold uppercase tracking-wider">{key}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strategies table */}
              {strategies.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Modo de Falla</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Estrategia</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Tarea</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Intervalo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {strategies.map((s, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 text-xs text-foreground">{s.failure_mode || s.failureMode || '---'}</td>
                          <td className="px-3 py-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STRATEGY_COLORS[s.strategy || s.task_type] || 'bg-muted text-muted-foreground'}`}>
                              {s.strategy || s.task_type || '---'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-foreground max-w-[200px] truncate">{s.task_description || s.task || '---'}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{s.interval || s.frequency || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* If result has a message or recommendation text */}
              {result.recommendation && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Recomendacion</div>
                  <p className="text-sm text-foreground">{result.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
