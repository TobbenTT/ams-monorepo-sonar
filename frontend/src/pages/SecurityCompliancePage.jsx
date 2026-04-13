import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Check, Clock, AlertCircle, ArrowLeft, Download, ExternalLink, Lock, Eye, FileText, Users, Database, Globe } from 'lucide-react';

const STATUS_CONFIG = {
  implemented: {
    icon: Check,
    label: 'Implemented',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  roadmap: {
    icon: Clock,
    label: 'On Roadmap',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  not_applicable: {
    icon: AlertCircle,
    label: 'N/A',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
};

const SECTION_META = {
  Certifications: { icon: Shield,  color: 'emerald' },
  'Pre-Contract': { icon: Lock,    color: 'blue' },
  Operation:      { icon: Eye,     color: 'purple' },
  Technical:      { icon: Database, color: 'indigo' },
  Exit:           { icon: FileText, color: 'teal' },
  Legal:          { icon: Globe,   color: 'slate' },
};

export default function SecurityCompliancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/security/compliance-status')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-slate-600">Loading compliance status...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-red-600">Failed to load: {error}</div>
      </div>
    );
  }

  // Group checks by section
  const sections = {};
  Object.entries(data.checks).forEach(([key, check]) => {
    if (!sections[check.section]) sections[check.section] = [];
    sections[check.section].push({ key, ...check });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">MAGEAM</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/contact" className="text-sm text-slate-600 hover:text-emerald-700">Contact Sales</Link>
            <Link
              to="/contact"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition shadow-sm"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Shield className="w-3.5 h-3.5" />
          ENTERPRISE SECURITY
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Security & Compliance
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          MAGEAM is built to meet the cybersecurity requirements of enterprise mining, oil &amp; gas,
          and industrial clients. Our compliance status is transparent, continuously assessed, and auditable.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600">{data.summary.compliance_pct}%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Overall Compliance</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{data.summary.implemented}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Controls Implemented</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-amber-600">{data.summary.on_roadmap}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">On Roadmap</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{data.summary.total_controls}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Controls</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Assessed {new Date(data.assessed_at).toLocaleString()} · Framework: {data.reference_framework}
        </p>
      </section>

      {/* Sections */}
      <section className="max-w-6xl mx-auto px-6 pb-12 space-y-6">
        {Object.entries(sections).map(([sectionName, checks]) => {
          const meta = SECTION_META[sectionName] || SECTION_META.Technical;
          const Icon = meta.icon;
          return (
            <div key={sectionName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`bg-gradient-to-r from-${meta.color}-600 to-${meta.color}-700 text-white p-5`}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {sectionName}
                </h2>
                <p className="text-white/80 text-xs mt-1">{checks.length} controls</p>
              </div>
              <div className="p-5 space-y-2">
                {checks.map((check) => {
                  const status = STATUS_CONFIG[check.status] || STATUS_CONFIG.not_applicable;
                  const StatusIcon = status.icon;
                  return (
                    <div key={check.key} className={`flex items-start gap-3 p-3 rounded-lg border ${status.bg} ${status.border}`}>
                      <div className={`${status.dot} text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold ${status.text}`}>{check.label}</span>
                          <span className={`text-xs font-semibold uppercase ${status.text} flex-shrink-0`}>{status.label}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{check.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Technical Resources */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">For Your Security Team</h2>
          <p className="text-slate-300 mb-6 text-sm max-w-2xl">
            The following endpoints and resources are available to authorized client security teams
            for integration, audit, and compliance verification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'SIEM Export API', detail: 'GET /api/v1/security/siem-export?format=json|cef', icon: Database },
              { label: 'Audit Log API', detail: 'GET /api/v1/admin/audit-log', icon: Eye },
              { label: 'Certificate of Deletion', detail: 'POST /api/v1/security/certificate-of-deletion', icon: FileText },
              { label: 'Incident Reporting', detail: 'POST /api/v1/security/report-incident', icon: AlertCircle },
              { label: 'Token Revocation', detail: 'POST /api/v1/security/revoke-tokens', icon: Lock },
              { label: 'Data Export', detail: 'GET /api/v1/admin/export-data', icon: Download },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 font-semibold text-white mb-1">
                  <item.icon className="w-4 h-4 text-emerald-400" />
                  {item.label}
                </div>
                <code className="text-xs text-slate-400 font-mono">{item.detail}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Need more detail for your compliance review?</h2>
          <p className="text-emerald-50 mb-6 text-sm max-w-xl mx-auto">
            Our team can provide a full security questionnaire response, DPA template, and architecture
            diagrams under NDA.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-3 rounded-lg font-semibold transition shadow-lg"
          >
            Contact Security Team
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-500">
          MAGEAM v{data.version} · Value Strategy Consulting · <Link to="/" className="hover:text-emerald-600">Home</Link>
        </div>
      </footer>
    </div>
  );
}
