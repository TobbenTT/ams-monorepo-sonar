import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import * as api from '../api';
import DevBanner from '../components/DevBanner';

// Weibull reliability R(t) and hazard h(t) — computed from real equipment parameters
function computeWeibull(beta, eta, points = 20) {
  const result = [];
  for (let i = 1; i <= points; i++) {
    const t = (i / points) * eta * 1.8;
    const R = Math.exp(-Math.pow(t / eta, beta));
    const h = (beta / eta) * Math.pow(t / eta, beta - 1);
    result.push({ t: Math.round(t), reliability: parseFloat((R * 100).toFixed(2)), hazard: parseFloat(h.toFixed(5)) });
  }
  return result;
}

export default function Reliability() {
  const { t } = useLanguage();
  const { plant } = useOutletContext();
  const [kpis, setKpis] = useState([]);
  const [selectedEq, setSelectedEq] = useState(null);
  const [detailEq, setDetailEq] = useState(null);
  const [failureEvents, setFailureEvents] = useState([]);

  const severityLabels = {
    minor: t('reliability.severityMinor'),
    moderate: t('reliability.severityModerate'),
    major: t('reliability.severityMajor'),
  };

  const severityDot = { minor: 'bg-green-400', moderate: 'bg-amber-400', major: 'bg-red-500' };

  const severityBadge = {
    minor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const trendIcon = (trend) => {
    if (trend === 'IMPROVING') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'WORSENING') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const trendLabels = {
    IMPROVING: t('reliability.improving'),
    WORSENING: t('reliability.worsening'),
    STABLE: t('reliability.stable'),
  };

  const trendBadge = (trend) => {
    const map = {
      IMPROVING: 'bg-green-500/20 text-green-300 border border-green-500/30',
      WORSENING: 'bg-red-500/20 text-red-300 border border-red-500/30',
      STABLE:    'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[trend] || map.STABLE}`}>
        {trendIcon(trend)}
        {trendLabels[trend] || trend}
      </span>
    );
  };

  useEffect(() => {
    // Load asset health data from the API
    api.getAssetHealth({ plant_id: plant })
      .then((data) => {
        const assets = data?.assets || (Array.isArray(data) ? data : []);
        if (assets.length > 0) {
          const mapped = assets
            .filter(d => d.equipment_tag)
            .map(d => ({
              equipment_tag: d.equipment_tag,
              equipment_name: d.equipment_name || d.equipment_tag,
              mtbf: d.mtbf || 0,
              mttr: d.mttr || 0,
              availability: d.availability || 0,
              oee: d.oee || 0,
              weibull_beta: d.weibull_beta || 2.0,
              weibull_eta: d.weibull_eta || d.mtbf || 500,
              weibull_calibrated: d.weibull_calibrated === true,
              weibull_n_failures: d.weibull_n_failures || 0,
              weibull_r2: d.weibull_r2 || null,
              failures_ytd: d.failures_ytd || 0,
              trend: d.trend || 'STABLE',
            }));
          if (mapped.length > 0) {
            setKpis(mapped);
            setSelectedEq(mapped[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load real failure events (PM03 work orders) for selected equipment
  useEffect(() => {
    if (!selectedEq?.equipment_tag) { setFailureEvents([]); return; }
    api.listManagedWOs({ plant_id: plant, wo_type: 'PM03', equipment_tag: selectedEq.equipment_tag, limit: 50 })
      .then((data) => {
        const items = data?.items || (Array.isArray(data) ? data : []);
        const evs = items
          .filter(w => w.equipment_tag === selectedEq.equipment_tag)
          .map(w => ({
            wo_number: w.wo_number,
            date: w.actual_end || w.actual_start || w.planned_start || w.created_at,
            description: w.description || w.title || '—',
            duration: w.actual_hours || w.estimated_hours || 0,
            status: w.status,
          }))
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 10);
        setFailureEvents(evs);
      })
      .catch(() => setFailureEvents([]));
  }, [selectedEq?.equipment_tag, plant]);

  if (!selectedEq) {
    return (
      <div className="min-h-screen bg-muted p-6">
        <h1 className="text-2xl font-bold text-foreground">{t('reliability.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('reliability.subtitle')}</p>
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-lg">{t('common.noData') || 'No data de confiabilidad disponibles'}</p>
          <p className="text-sm mt-2">{t('reliability.noFailures') || 'Configure los datos de equipos desde el backend para ver análisis de confiabilidad.'}</p>
        </div>
      </div>
    );
  }

  const weibullData = computeWeibull(selectedEq.weibull_beta, selectedEq.weibull_eta);

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('reliability.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('reliability.subtitle')}
        </p>
        <div className="mt-3">
          {(() => {
            const calibrated = kpis.filter(k => k.weibull_calibrated).length;
            const total = kpis.length;
            if (total === 0) return null;
            if (calibrated === total) return null;
            return (
              <DevBanner variant="subtle">
                Weibull β/η fitted con histórico real en {calibrated}/{total} equipos (≥3 fallas). Resto usa β=2.0 (default conservador) hasta acumular más eventos.
              </DevBanner>
            );
          })()}
        </div>
      </div>

      {/* Equipment selector */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">{t('common.equipment')}:</span>
        {kpis.map((kpi) => (
          <button
            key={kpi.equipment_tag}
            onClick={() => setSelectedEq(kpi)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedEq.equipment_tag === kpi.equipment_tag
                ? 'bg-emerald-700 text-white border-emerald-700 shadow'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {kpi.equipment_tag}
          </button>
        ))}
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-200 text-sm font-medium">{t('reliability.selectedEquipment')}</span>
            </div>
            <h2 className="text-xl font-bold">{selectedEq.equipment_name}</h2>
            <p className="text-emerald-300 text-sm">{selectedEq.equipment_tag}</p>
          </div>
          <div>{trendBadge(selectedEq.trend)}</div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {[
            { label: t('reliability.mtbf'), value: `${selectedEq.mtbf} h`, sub: t('reliability.mtbfDesc') },
            { label: t('reliability.mttr'), value: `${selectedEq.mttr} h`, sub: t('reliability.mttrDesc') },
            { label: t('reliability.availability'), value: `${selectedEq.availability}%`, sub: t('reliability.mechAvailability') },
            { label: 'OEE', value: `${selectedEq.oee}%`, sub: t('reliability.globalEfficiency') },
            { label: t('reliability.weibullBeta'), value: selectedEq.weibull_beta, sub: t('reliability.shapeFactor') },
            { label: t('reliability.weibullEta'), value: `${selectedEq.weibull_eta} h`, sub: t('reliability.charLife') },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-emerald-300 text-xs mb-1">{label}</p>
              <p className="text-white text-lg font-bold">{value}</p>
              <p className="text-emerald-400 text-xs mt-0.5 leading-tight">{sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-emerald-300 text-xs">
            {t('reliability.failuresYTD')}:
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            selectedEq.failures_ytd >= 5
              ? 'bg-red-500/30 text-red-200'
              : selectedEq.failures_ytd >= 3
              ? 'bg-amber-500/30 text-amber-200'
              : 'bg-green-500/30 text-green-200'
          }`}>
            {selectedEq.failures_ytd} {t('reliability.failureCount')}
          </span>
          <span className="text-emerald-400 text-xs">
            {selectedEq.weibull_beta > 1 ? t('reliability.wearOut') : selectedEq.weibull_beta < 1 ? t('reliability.infantMortality') : t('reliability.random')}
          </span>
        </div>
      </div>

      {/* 4-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weibull R(t) */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t('reliability.reliabilityFunction')}</h3>
            <span className="text-xs text-muted-foreground">{t('reliability.weibullBeta')}={selectedEq.weibull_beta}, {t('reliability.weibullEta')}={selectedEq.weibull_eta}h</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weibullData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#9ca3af' }} label={{ value: `${t('reliability.time')} (h)`, position: 'insideBottom', offset: -3, fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [`${v}%`, t('reliability.reliabilityLabel')]}
                labelFormatter={(v) => `t = ${v} h`}
              />
              <Area type="monotone" dataKey="reliability" stroke="#10b981" strokeWidth={2} fill="url(#relGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-muted-foreground">
            R(t) = e<sup>-(t/η)<sup>β</sup></sup> — {t('reliability.survivalProbability')}
          </div>
        </div>

        {/* Hazard h(t) */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t('reliability.hazardFunction')}</h3>
            <span className="text-xs text-muted-foreground">
              {selectedEq.weibull_beta > 1 ? t('reliability.increasingRate') : selectedEq.weibull_beta < 1 ? t('reliability.decreasingRate') : t('reliability.constantRate')}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weibullData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#9ca3af' }} label={{ value: `${t('reliability.time')} (h)`, position: 'insideBottom', offset: -3, fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [v.toFixed(6), 'h(t)']}
                labelFormatter={(v) => `t = ${v} h`}
              />
              <Line type="monotone" dataKey="hazard" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-muted-foreground">
            h(t) = (β/η)·(t/η)<sup>β-1</sup> — {t('reliability.instantaneousRate')}
          </div>
        </div>

        {/* Failure history — from API data */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('reliability.failureHistory')}</h3>
          {failureEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t('reliability.noFailures')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr className="border-b border-border">
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">OT</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Fecha</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Descripción</th>
                    <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Hrs</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {failureEvents.map(ev => (
                    <tr key={ev.wo_number} className="border-b border-border hover:bg-muted">
                      <td className="px-2 py-1.5 font-mono text-foreground">{ev.wo_number}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                      <td className="px-2 py-1.5 text-foreground truncate max-w-[200px]" title={ev.description}>{ev.description}</td>
                      <td className="px-2 py-1.5 text-right font-medium">{Number(ev.duration || 0).toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{ev.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('reliability.totalFailures')}: <strong>{selectedEq.failures_ytd}</strong></span>
              <span>{t('reliability.realMTBF')}: <strong>{selectedEq.mtbf} h</strong></span>
              <span>{t('reliability.mttr')}: <strong>{selectedEq.mttr} h</strong></span>
            </div>
          </div>
        </div>

        {/* Fleet summary */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('reliability.fleetSummary')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted border-b border-border">
                  {[t('common.equipment'), t('reliability.mtbf'), t('reliability.availability'), 'OEE', 'β', t('reliability.failuresLabel'), t('reliability.trendLabel')].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi) => (
                  <tr
                    key={kpi.equipment_tag}
                    onClick={() => { setSelectedEq(kpi); setDetailEq(detailEq?.equipment_tag === kpi.equipment_tag ? null : kpi); }}
                    className={`border-b border-border cursor-pointer transition-colors ${
                      selectedEq.equipment_tag === kpi.equipment_tag
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <td className="px-2 py-2">
                      <div className="font-medium text-foreground">{kpi.equipment_tag}</div>
                      <div className="text-muted-foreground">{kpi.equipment_name.split(' ').slice(0, 2).join(' ')}</div>
                    </td>
                    <td className="px-2 py-2 font-medium text-foreground">{kpi.mtbf} h</td>
                    <td className="px-2 py-2">
                      <span className={`font-bold ${kpi.availability >= 99 ? 'text-green-600' : kpi.availability >= 97 ? 'text-amber-600' : 'text-red-600'}`}>
                        {kpi.availability}%
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`font-medium ${kpi.oee >= 90 ? 'text-green-600' : kpi.oee >= 85 ? 'text-amber-600' : 'text-red-600'}`}>
                        {kpi.oee}%
                      </span>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{kpi.weibull_beta}</td>
                    <td className="px-2 py-2">
                      <span className={`font-bold ${kpi.failures_ytd >= 5 ? 'text-red-600' : kpi.failures_ytd >= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                        {kpi.failures_ytd}
                      </span>
                    </td>
                    <td className="px-2 py-2">{trendBadge(kpi.trend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t('reliability.clickToAnalyze')}
          </p>

          {/* Detail panel — expands on row click */}
          {detailEq && (() => {
            const wb = computeWeibull(detailEq.weibull_beta, detailEq.weibull_eta);
            return (
              <div className="mt-4 border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 p-4 animate-in fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-foreground">{detailEq.equipment_name} — {detailEq.equipment_tag}</h4>
                  <button onClick={(e) => { e.stopPropagation(); setDetailEq(null); }} className="text-xs text-muted-foreground hover:text-foreground">&times; Close</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'MTBF', value: `${detailEq.mtbf} h`, color: 'text-blue-600' },
                    { label: 'MTTR', value: `${detailEq.mttr} h`, color: 'text-orange-600' },
                    { label: 'Availability', value: `${detailEq.availability}%`, color: detailEq.availability >= 97 ? 'text-green-600' : 'text-red-600' },
                    { label: 'OEE', value: `${detailEq.oee}%`, color: detailEq.oee >= 85 ? 'text-green-600' : 'text-red-600' },
                    { label: 'Weibull β', value: detailEq.weibull_beta, color: 'text-purple-600' },
                    { label: 'Weibull η', value: `${detailEq.weibull_eta} h`, color: 'text-purple-600' },
                    { label: 'Failures YTD', value: detailEq.failures_ytd, color: detailEq.failures_ytd >= 3 ? 'text-red-600' : 'text-green-600' },
                    { label: 'Trend', value: detailEq.trend, color: detailEq.trend === 'IMPROVING' ? 'text-green-600' : detailEq.trend === 'WORSENING' ? 'text-red-600' : 'text-gray-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-card rounded-lg border border-border p-2">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">R(t) — Reliability</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={wb} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} unit="%" />
                        <Area type="monotone" dataKey="reliability" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">h(t) — Hazard Rate</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={wb} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Line type="monotone" dataKey="hazard" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {detailEq.weibull_beta > 1 ? 'Wear-out phase (β > 1) — consider time-based or condition-based maintenance' :
                   detailEq.weibull_beta < 1 ? 'Infant mortality (β < 1) — check installation/commissioning quality' :
                   'Random failures (β ≈ 1) — condition monitoring recommended'}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
