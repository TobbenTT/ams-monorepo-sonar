import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Database, Bot, Clock, Server, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ ok }) {
  return ok ? (
    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
      <CheckCircle2 className="w-5 h-5" /> Operational
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-red-600 font-semibold text-sm">
      <XCircle className="w-5 h-5" /> Degraded
    </span>
  );
}

function formatUptime(seconds) {
  if (!seconds) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const allOk = data?.status === 'ok';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MAGEAM Status</h1>
          <p className="text-gray-500">Real-time system health</p>
        </div>

        {/* Overall status */}
        <div className={`rounded-2xl p-6 mb-8 text-center border-2 ${
          loading ? 'bg-gray-100 border-gray-200' :
          error ? 'bg-red-50 border-red-200' :
          allOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-gray-600 font-medium">Checking systems...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-xl font-bold text-red-700">System Unreachable</p>
                <p className="text-sm text-red-500">API is not responding</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              {allOk ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <AlertCircle className="w-8 h-8 text-amber-500" />}
              <div>
                <p className="text-xl font-bold" style={{ color: allOk ? '#059669' : '#d97706' }}>
                  {allOk ? 'All Systems Operational' : 'Partial Degradation'}
                </p>
                <p className="text-sm text-gray-500">v{data.version} &middot; build {data.build}</p>
              </div>
            </div>
          )}
        </div>

        {/* Services */}
        {data && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">API Server</p>
                  <p className="text-xs text-gray-400">FastAPI backend</p>
                </div>
              </div>
              <StatusBadge ok={true} />
            </div>

            <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Database</p>
                  <p className="text-xs text-gray-400">PostgreSQL</p>
                </div>
              </div>
              <StatusBadge ok={data.database === 'ok'} />
            </div>

            <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">AI Agents (CORTEX)</p>
                  <p className="text-xs text-gray-400">Anthropic API</p>
                </div>
              </div>
              {data.ai_available ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5" /> Not configured
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Uptime</p>
                  <p className="text-xs text-gray-400">Since last restart</p>
                </div>
              </div>
              <span className="font-semibold text-gray-700 text-sm">{formatUptime(data.uptime_seconds)}</span>
            </div>
          </div>
        )}

        {/* Counts */}
        {data?.counts && Object.keys(data.counts).length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Data Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.counts).map(([k, v]) => (
                <div key={k} className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{v.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{k.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-10">
          MAGEAM &middot; Value Strategy Consulting
        </p>
      </div>
    </div>
  );
}
