import { useState, useEffect, useMemo } from 'react';
import { Calendar, Package, Gauge, Shield, ShoppingCart, DollarSign, Database,
  AlertTriangle, Clock, CheckCircle, XCircle, Thermometer, Activity, Droplets,
  Zap, BarChart3, ChevronRight, Search, Filter, Warehouse } from 'lucide-react';
import { listMaintenancePlans, getEquipmentBOM, listMeasuringPoints, listPermits, listPurchaseReqs, listCostCenters, listSettlementRules, listInventory, sapSyncHealth, sapSyncQueueList, sapSyncQueueAdd } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

const TABS = [
  { id: 'plans', label: 'Maint. Plans (IP10)', icon: Calendar, sap: 'IP10/IP30' },
  { id: 'bom', label: 'Bill of Materials (BOM)', icon: Package, sap: 'IB01' },
  { id: 'measuring', label: 'Measuring Points', icon: Gauge, sap: 'IK01' },
  { id: 'permits', label: 'Work Permits', icon: Shield, sap: 'LOTO/PTW' },
  { id: 'purchase', label: 'Requisitions', icon: ShoppingCart, sap: 'ME51N' },
  { id: 'costs', label: 'Cost Centers', icon: DollarSign, sap: 'KO88' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, sap: 'MM60' },
  { id: 'sync', label: 'Sync Bidireccional (SF-591)', icon: Database, sap: 'Phase 2' },
];

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-100 text-emerald-700', INACTIVE: 'bg-gray-100 text-gray-500',
  DRAFT: 'bg-gray-100 text-gray-600', PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700', CLOSED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-600', CREATED: 'bg-gray-100 text-gray-600',
  PO_CREATED: 'bg-indigo-100 text-indigo-700', DELIVERED: 'bg-emerald-100 text-emerald-700',
  SETTLED: 'bg-emerald-100 text-emerald-700', REVERSED: 'bg-red-100 text-red-600',
  HIGH: 'bg-red-100 text-red-700 border-red-200', MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PERMIT_TYPE_ICONS = {
  HOT_WORK: { icon: '🔥', label: 'Hot Work' },
  CONFINED_SPACE: { icon: '🏗️', label: 'Confined Space' },
  ELECTRICAL: { icon: '⚡', label: 'Electrical Work' },
  HEIGHT: { icon: '🪜', label: 'Height Work' },
  EXCAVATION: { icon: '🚧', label: 'Excavation' },
  GENERAL: { icon: '📋', label: 'General' },
};

const MEAS_ICONS = {
  TEMPERATURE: Thermometer, VIBRATION: Activity, PRESSURE: Gauge,
  FLOW: Droplets, LEVEL: BarChart3, CURRENT: Zap,
};

export default function SapPmPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [tab, setTab] = useState('plans');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [selectedEquip, setSelectedEquip] = useState('P-1201A');

  const EQUIPS = ['P-1201A','AG-3101','R-3102','FP-3201','PP-3202','GR-4101','DR-4102','CV-4201','CV-4202','BL-5001','CW-5101','CP-5102'];

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        const [plans, measuring, permits, prs, costs, settlements, inventory] = await Promise.all([
          listMaintenancePlans({}).catch(() => []),
          listMeasuringPoints({}).catch(() => []),
          listPermits({}).catch(() => []),
          listPurchaseReqs({}).catch(() => []),
          listCostCenters().catch(() => []),
          listSettlementRules({}).catch(() => []),
          listInventory({}).catch(() => []),
        ]);
        setData({ plans, measuring, permits, prs, costs, settlements, inventory });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const [bomData, setBomData] = useState([]);
  useEffect(() => {
    if (tab === 'bom' && selectedEquip) {
      getEquipmentBOM(selectedEquip).then(setBomData).catch(() => setBomData([]));
    }
  }, [tab, selectedEquip]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" /> SAP PM - Integrated Modules
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Plant OCP-JFC1 — Jorf Fertilizers Complex 1</p>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">SAP ECC 6.0 EHP8</span>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
            <t.icon size={14} />
            {t.label}
            <span className="text-[9px] font-mono text-gray-400 ml-1">{t.sap}</span>
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Loading datos SAP PM...</div>}

      {/* ── TAB: Maintenance Plans ── */}
      {!loading && tab === 'plans' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Preventive Maintenance Plans</h2>
              <p className="text-[10px] text-gray-400">IP10 — Plan scheduling | IP30 — Date monitoring</p>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{(data.plans||[]).length} plans</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Plan #</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Equipment</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Type</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Cycle</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Strategy</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Next Date</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data.plans||[]).map(p => {
                const overdue = p.next_planned_date && p.next_planned_date < today;
                const soon = p.next_planned_date && !overdue && p.next_planned_date < new Date(Date.now()+30*86400000).toISOString().slice(0,10);
                return (
                <tr key={p.plan_id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-emerald-700">{p.plan_number}</td>
                  <td className="px-4 py-2.5 text-gray-700 max-w-[300px] truncate">{p.description}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.equipment_tag}</td>
                  <td className="px-4 py-2.5 text-center"><span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{p.plan_type}</span></td>
                  <td className="px-4 py-2.5 text-center text-xs">{p.cycle_value} {p.cycle_unit === 'DAYS' ? 'dias' : p.cycle_unit}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-gray-500">{p.strategy}</td>
                  <td className={`px-4 py-2.5 text-center text-xs font-semibold ${overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-gray-600'}`}>
                    {p.next_planned_date || '—'} {overdue && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                  </td>
                  <td className="px-4 py-2.5 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[p.status]||''}`}>{p.status}</span></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB: BOM ── */}
      {!loading && tab === 'bom' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Equipment:</label>
            <select value={selectedEquip} onChange={e => setSelectedEquip(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              {EQUIPS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <span className="text-xs text-gray-400 font-mono">IB03 — View bill of materials</span>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">SAP Code</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Unit</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Critico</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bomData.map(b => (
                  <tr key={b.bom_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs">{String(b.item_number).padStart(4,'0')}</td>
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-emerald-700">{b.material_code}</td>
                    <td className="px-4 py-2.5">{b.description}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{b.quantity}</td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{b.unit}</td>
                    <td className="px-4 py-2.5 text-center">{b.is_critical ? <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">CRITICO</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2.5 text-center text-xs">{b.lead_time_days} dias</td>
                  </tr>
                ))}
                {bomData.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No BOM for this equipment</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Measuring Points ── */}
      {!loading && tab === 'measuring' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800">Measuring Points — Condition Monitoring</h2>
            <p className="text-[10px] text-gray-400">IK01 — Create measuring point | IK11 — Record measurement</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Equipment</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Point</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Type</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Limits</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Last Value</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Unit</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data.measuring||[]).map(m => {
                const val = m.last_reading;
                const alarm = val !== null && (val > m.upper_limit || val < m.lower_limit);
                const warn = val !== null && !alarm && (val > m.upper_limit * 0.9 || val < m.lower_limit * 1.1);
                const MIcon = MEAS_ICONS[m.measurement_type] || Gauge;
                return (
                <tr key={m.point_id} className={`hover:bg-gray-50 ${alarm ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold">{m.equipment_tag}</td>
                  <td className="px-4 py-2.5 text-gray-700">{m.point_name}</td>
                  <td className="px-4 py-2.5 text-center"><MIcon size={14} className="inline text-gray-500" /></td>
                  <td className="px-4 py-2.5 text-center text-[10px] text-gray-400 font-mono">{m.lower_limit} — {m.upper_limit}</td>
                  <td className={`px-4 py-2.5 text-center font-bold ${alarm ? 'text-red-600' : warn ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {val !== null ? val : '—'} {alarm && <AlertTriangle size={12} className="inline ml-1" />}
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-500">{m.unit}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${alarm ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB: Permits ── */}
      {!loading && tab === 'permits' && (
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-bold text-gray-800">Work Permits / LOTO</h2>
            <p className="text-[10px] text-gray-400">Hazardous work control — Lockout & Tagout</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data.permits||[]).map(p => {
              const pt = PERMIT_TYPE_ICONS[p.permit_type] || PERMIT_TYPE_ICONS.GENERAL;
              const loto = typeof p.loto_points === 'string' ? JSON.parse(p.loto_points || '[]') : (p.loto_points || []);
              const safety = typeof p.safety_measures === 'string' ? JSON.parse(p.safety_measures || '[]') : (p.safety_measures || []);
              return (
              <div key={p.permit_id} className={`border rounded-xl p-4 ${p.risk_level === 'HIGH' ? 'border-red-200 bg-red-50/30' : p.risk_level === 'MEDIUM' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pt.icon}</span>
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-800">{p.permit_number}</span>
                      <span className="text-[10px] text-gray-400 ml-2">{pt.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[p.risk_level]||''}`}>{p.risk_level}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[p.status]||''}`}>{p.status}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{p.description}</p>
                <div className="flex gap-4 text-[10px] text-gray-500 mb-2">
                  {p.wo_number && <span>OT: <span className="font-mono font-bold">{p.wo_number}</span></span>}
                  {p.equipment_tag && <span>Equipment: <span className="font-mono font-bold">{p.equipment_tag}</span></span>}
                  <span>Solicitante: {p.requested_by}</span>
                </div>
                {p.loto_required === 1 && loto.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-2 mb-2 border">
                    <span className="text-[10px] font-bold text-red-700 uppercase">LOTO Points:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loto.map((l, i) => (
                        <span key={i} className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono">
                          {l.tag} ({l.type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {safety.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {safety.slice(0,4).map((s, i) => (
                      <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {safety.length > 4 && <span className="text-[9px] text-gray-400">+{safety.length-4} mas</span>}
                  </div>
                )}
              </div>
            );})}
          </div>
        </div>
      )}

      {/* ── TAB: Purchase Requisitions ── */}
      {!loading && tab === 'purchase' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800">Requisitions de Compra</h2>
            <p className="text-[10px] text-gray-400">ME51N — Create purchase requisition | ME5A — Requisition list</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">PR #</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">OT</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Material</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Est. Cost</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Vendor</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Delivery</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data.prs||[]).map(pr => (
                <tr key={pr.pr_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-emerald-700">{pr.pr_number}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{pr.wo_number || '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{pr.material_code}</td>
                  <td className="px-4 py-2.5 max-w-[200px] truncate">{pr.description}</td>
                  <td className="px-4 py-2.5 text-center font-semibold">{pr.quantity} {pr.unit}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{pr.estimated_cost?.toLocaleString()} {pr.currency}</td>
                  <td className="px-4 py-2.5 text-xs">{pr.vendor}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{pr.delivery_date}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[pr.status]||''}`}>{pr.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB: Cost Centers ── */}
      {!loading && tab === 'costs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(data.costs||[]).map(cc => {
              const pct = cc.budget_annual > 0 ? Math.round((cc.budget_used / cc.budget_annual) * 100) : 0;
              const over = pct > 90;
              return (
              <div key={cc.cc_id} className={`bg-white border rounded-xl p-4 ${over ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-gray-500">{cc.cc_code}</span>
                  <span className={`text-[10px] font-bold ${over ? 'text-red-600' : 'text-emerald-600'}`}>{pct}%</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-800 mb-2 leading-tight">{cc.cc_name}</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full ${over ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(pct,100)}%`}}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{(cc.budget_used||0).toLocaleString()} MAD</span>
                  <span>{(cc.budget_annual||0).toLocaleString()} MAD</span>
                </div>
              </div>
            );})}
          </div>
          {(data.settlements||[]).length > 0 && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800">Settlement Rules (KO88)</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">OT</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Cost Center</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">%</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Amount</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Date</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data.settlements||[]).map(s => (
                    <tr key={s.rule_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold">{s.wo_number}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{s.cost_center_code}</td>
                      <td className="px-4 py-2.5 text-center">{s.settlement_pct}%</td>
                      <td className="px-4 py-2.5 text-right font-mono">{s.settled_amount?.toLocaleString()} MAD</td>
                      <td className="px-4 py-2.5 text-center text-xs">{s.settlement_date || '—'}</td>
                      <td className="px-4 py-2.5 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[s.status]||''}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Inventory ── */}
      {!loading && tab === 'inventory' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Spare Parts Inventory — Warehouse JFC1</h2>
              <p className="text-[10px] text-gray-400">MM60 — Inventory list | MMBE — Stock summary</p>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{(data.inventory||[]).length} items</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">SAP Code</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Description</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">In Stock</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Reserved</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Available</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Min.</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Reorder</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data.inventory||[]).map(item => {
                const low = item.quantity_available <= item.reorder_point;
                const critical = item.quantity_available <= item.min_stock;
                return (
                <tr key={item.item_id} className={`hover:bg-gray-50 ${critical ? 'bg-red-50/50' : low ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-emerald-700">{item.material_code}</td>
                  <td className="px-4 py-2.5">{item.description}</td>
                  <td className="px-4 py-2.5 text-center font-semibold">{item.quantity_on_hand}</td>
                  <td className="px-4 py-2.5 text-center text-gray-500">{item.quantity_reserved}</td>
                  <td className={`px-4 py-2.5 text-center font-bold ${critical ? 'text-red-600' : low ? 'text-amber-600' : 'text-emerald-700'}`}>{item.quantity_available}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-400">{item.min_stock}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-400">{item.reorder_point}</td>
                  <td className="px-4 py-2.5 text-center">
                    {critical ? <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">CRITICO</span> :
                     low ? <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">BAJO</span> :
                     <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">OK</span>}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
      {/* SF-591 — Sync bidireccional SAP (Phase 2 stub honest) */}
      {!loading && tab === 'sync' && (
        <SapSyncPanel />
      )}
    </div>
  );
}

function SapSyncPanel() {
  const [health, setHealth] = useState(null);
  const [queue, setQueue] = useState([]);
  const [transportInfo, setTransportInfo] = useState(null);
  const [transportCounts, setTransportCounts] = useState({});
  const [processing, setProcessing] = useState(false);
  const [liveEquipment, setLiveEquipment] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const fetchAll = () => {
    const token = localStorage.getItem('access_token');
    const H = { Authorization: `Bearer ${token}` };
    // Endpoints viejos solo para el banner Phase 2 + blockers
    sapSyncHealth().then(setHealth).catch(() => setHealth(null));
    // Endpoints nuevos (SF-728+ Strategy Pattern + Mock-SAP)
    fetch('/api/v1/sap/transport/info', { headers: H })
      .then(r => r.json()).then(setTransportInfo).catch(() => setTransportInfo(null));
    fetch('/api/v1/sap/queue', { headers: H })
      .then(r => r.json()).then(d => {
        setTransportCounts(d?.counts || {});
        setQueue(Array.isArray(d?.recent) ? d.recent : []);
      }).catch(() => {});
  };
  useEffect(() => { fetchAll(); }, []);

  const processQueue = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      const r = await fetch('/api/v1/sap/queue/process', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      fetchAll();
      return r;
    } finally { setProcessing(false); }
  };

  const fetchLiveSapData = async () => {
    setLiveLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const H = { Authorization: `Bearer ${token}` };
      const [eqR, ordR] = await Promise.all([
        fetch('/api/v1/sap/live/equipment?top=10', { headers: H }).then(r => r.json()),
        fetch('/api/v1/sap/live/maintenance-orders?top=10', { headers: H }).then(r => r.json()),
      ]);
      setLiveEquipment(eqR?.items || []);
      setLiveOrders(ordR?.items || []);
    } catch (e) {
      console.error('live SAP fetch failed', e);
    } finally { setLiveLoading(false); }
  };
  return (
    <div className="space-y-4">
      {/* NEW · Transport Strategy Pattern panel (commit 349916e) */}
      <div className={`rounded-xl border-2 p-5 ${transportInfo?.name === 'dry_run' ? 'bg-slate-50 border-slate-300' : transportInfo?.healthy ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-300'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Database className={`w-7 h-7 ${transportInfo?.healthy ? 'text-emerald-600' : 'text-slate-500'}`} />
            <div>
              <h3 className="text-base font-bold text-gray-900">SAP Transport activo</h3>
              <p className="text-xs text-gray-600">Selección por env <code className="bg-white px-1 rounded">SAP_TRANSPORT</code> · cambio sin redeploy</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold uppercase tracking-wide">
              <span className={transportInfo?.healthy ? 'text-emerald-700' : 'text-amber-700'}>
                {transportInfo?.name || '—'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500">{transportInfo?.healthy ? '✓ healthy' : '⚠ no healthy'}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {['dry_run', 'mock', 'rfc', 'odata'].map(opt => (
            <div key={opt} className={`text-center text-xs font-semibold rounded-lg px-2 py-2 border ${transportInfo?.name === opt ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-gray-500 border-gray-200'}`}>
              {opt}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-lg border p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-600">Pending</div>
            <div className="text-2xl font-bold tabular-nums text-amber-700">{transportCounts.PENDING || 0}</div>
          </div>
          <div className="bg-white rounded-lg border p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-600">Sent</div>
            <div className="text-2xl font-bold tabular-nums text-emerald-700">{transportCounts.SENT || 0}</div>
          </div>
          <div className="bg-white rounded-lg border p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-600">Dead Letter</div>
            <div className="text-2xl font-bold tabular-nums text-rose-700">{transportCounts.DEAD_LETTER || 0}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={processQueue} disabled={processing}
            className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50">
            {processing ? 'Procesando…' : '⚡ Procesar batch (max 10)'}
          </button>
          <button onClick={fetchAll} className="px-3 py-2 rounded-lg bg-white border text-xs font-bold text-slate-700 hover:bg-slate-50">
            ↻ Refrescar
          </button>
        </div>
      </div>

      {/* ── LIVE SAP DATA (lectura real via transport activo) ── */}
      <div className="bg-white rounded-xl border-2 border-emerald-300 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              SAP Live Data <span className="text-[10px] font-normal bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">vía transport "{transportInfo?.name || '—'}"</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Lectura en vivo (GET /api/v1/sap/live/*). Funciona en sandbox público SAP, mock y odata productivo.</p>
          </div>
          <button onClick={fetchLiveSapData} disabled={liveLoading}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold">
            {liveLoading ? 'Leyendo…' : '⬇ Leer SAP ahora'}
          </button>
        </div>

        {liveEquipment.length === 0 && liveOrders.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-6">Click "Leer SAP ahora" para traer equipos + maintenance orders del SAP configurado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipment */}
            <div>
              <h4 className="text-xs font-bold uppercase text-emerald-700 mb-2">Equipos ({liveEquipment.length})</h4>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-bold">Equipment</th>
                      <th className="px-2 py-1.5 text-left font-bold">Name</th>
                      <th className="px-2 py-1.5 text-left font-bold">Cat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveEquipment.map((e, i) => (
                      <tr key={e.Equipment || e.equipment_id || i} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 font-mono">{e.Equipment || e.equipment_id || '—'}</td>
                        <td className="px-2 py-1.5 truncate max-w-[200px]" title={e.EquipmentName || e.equipment_name}>{e.EquipmentName || e.equipment_name || '—'}</td>
                        <td className="px-2 py-1.5"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100">{e.EquipmentCategory || e.equipment_category || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Maintenance Orders */}
            <div>
              <h4 className="text-xs font-bold uppercase text-blue-700 mb-2">Maintenance Orders ({liveOrders.length})</h4>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-bold">Order</th>
                      <th className="px-2 py-1.5 text-left font-bold">Type</th>
                      <th className="px-2 py-1.5 text-left font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveOrders.map((o, i) => (
                      <tr key={o.MaintenanceOrder || o.maintenance_order || i} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 font-mono">{o.MaintenanceOrder || o.maintenance_order || '—'}</td>
                        <td className="px-2 py-1.5"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{o.MaintenanceOrderType || o.maintenance_order_type || '—'}</span></td>
                        <td className="px-2 py-1.5 truncate max-w-[260px]" title={o.MaintenanceOrderDesc || o.short_text}>{o.MaintenanceOrderDesc || o.MaintOrderShortText || o.short_text || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Banner Phase 2 */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900 mb-1">Integración SAP bidireccional — Phase 2</h3>
            <p className="text-sm text-amber-800 mb-2">
              <strong>Conector SAP no activo.</strong> Los hallazgos de la IA (fallas crónicas, FMECA, RCA, cambios de estrategia)
              se encolan localmente en <code className="bg-amber-100 px-1 rounded">sap_sync_log</code> con status PENDING.
              Cuando se active la integración real, el worker procesará la cola.
            </p>
            <div className="text-xs text-amber-700 mt-3 space-y-1">
              <strong>Bloqueadores para activación:</strong>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                {(health?.blockers || []).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <p className="mt-2"><strong>Esfuerzo estimado:</strong> {health?.estimated_effort_hours || 60}h una vez recibidas credenciales.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints status */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Endpoints planificados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border-l-4 border-blue-400 bg-blue-50/40 rounded-r-lg p-3">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">⬇ Inbound (SAP → MAGEAM)</h4>
            <ul className="text-xs space-y-1.5 text-gray-700">
              <li>📋 <strong>Costos plan/real</strong> por OT (BAPI_PROD_ORDER_GET_DETAIL)</li>
              <li>📅 <strong>Estrategias mantenimiento</strong> (IK17 / IP10)</li>
              <li>🏭 <strong>Ubicaciones técnicas</strong> + maestros equipos (IH08)</li>
              <li>💰 <strong>Centros de costo</strong> (KS03)</li>
              <li>📦 <strong>Inventario MM</strong> (MMBE / MM60)</li>
            </ul>
          </div>
          <div className="border-l-4 border-rose-400 bg-rose-50/40 rounded-r-lg p-3">
            <h4 className="text-xs font-bold text-rose-800 uppercase mb-2">⬆ Outbound (MAGEAM → SAP)</h4>
            <ul className="text-xs space-y-1.5 text-gray-700">
              <li>🔥 <strong>Fallas crónicas</strong> → Avisos QM</li>
              <li>📊 <strong>FMECA RPN</strong> → Maestro equipo (Z-table)</li>
              <li>📝 <strong>RCA findings</strong> → MoC</li>
              <li>♻️ <strong>Strategy updates</strong> (frecuencia ajustada)</li>
              <li>💸 <strong>Cierre OT</strong> con HH/material reales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Estadísticas cola — usa datos reales del transport (Strategy Pattern) */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Cola de sincronización (sap_sync_log · live)</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-700">Pending</div>
            <div className="text-2xl font-bold tabular-nums">{transportCounts.PENDING || 0}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Sent</div>
            <div className="text-2xl font-bold tabular-nums">{transportCounts.SENT || 0}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-700">Acked</div>
            <div className="text-2xl font-bold tabular-nums">{transportCounts.ACKED || 0}</div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-rose-700">Dead Letter</div>
            <div className="text-2xl font-bold tabular-nums">{transportCounts.DEAD_LETTER || 0}</div>
          </div>
        </div>
        {queue.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-4">Cola vacía. Los eventos de sync aparecerán aquí cuando la IA detecte hallazgos para SAP.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1.5 text-left font-bold">ID</th>
                  <th className="px-2 py-1.5 text-left font-bold">Entidad</th>
                  <th className="px-2 py-1.5 text-left font-bold">Status</th>
                  <th className="px-2 py-1.5 text-center font-bold">Intentos</th>
                  <th className="px-2 py-1.5 text-left font-bold">Creado</th>
                  <th className="px-2 py-1.5 text-left font-bold">SAP Ref</th>
                </tr>
              </thead>
              <tbody>
                {queue.slice(0, 20).map(e => {
                  const tone = e.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                               e.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' :
                               e.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                               'bg-gray-100 text-gray-700';
                  return (
                    <tr key={e.id} className="border-t border-gray-100">
                      <td className="px-2 py-1.5 font-mono">#{e.id}</td>
                      <td className="px-2 py-1.5">{e.entity_type}: {(e.entity_id || '').slice(0, 16)}</td>
                      <td className="px-2 py-1.5"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tone}`}>{e.status}</span></td>
                      <td className="px-2 py-1.5 text-center">{e.attempts}</td>
                      <td className="px-2 py-1.5 text-gray-500">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}</td>
                      <td className="px-2 py-1.5 font-mono text-gray-500">{e.sap_ref || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-500 italic">
        Jorge transcript 2026-04-28 17:56: "claro, si la herramienta se puede [conectar] con un ERP, no hay que cargarla con datos manualmente. Lo mismo la estrategia". Esta es la base — endpoints stub + queue persistente. Cuando Goldfields entregue credenciales SAP, el worker pasa de stub a real sin cambios en el resto de la app (los hallazgos ya se encolan).
      </p>
    </div>
  );
}
