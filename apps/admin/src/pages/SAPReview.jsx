import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Database, Upload, CheckCircle, AlertCircle, Link, Loader2 } from 'lucide-react';
import { statusColor } from '../data/mockData';
import * as api from '../api';

function formatMAD(value) {
  return value.toLocaleString('es-MA') + ' MAD';
}

function formatKMAD(value) {
  return (value / 1000).toFixed(1) + 'K MAD';
}

export default function SAPReview() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const SAP_STATUS = {
    TECO: { label: t('sap.statusTECO'), color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
    CONF: { label: t('sap.statusCONF'), color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
    CLSD: { label: t('sap.statusCLSD'), color: 'bg-muted text-foreground border-border' },
    REL: { label: t('sap.statusREL'), color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
    CRTD: { label: t('sap.statusCRTD'), color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  };

  const ORDER_TYPES = {
    PM01: t('sap.orderPM01'),
    PM02: t('sap.orderPM02'),
    PM03: t('sap.orderPM03'),
  };

  const UPLOAD_STEPS = [
    { label: t('sap.uploadSteps.generate'), state: 'done' },
    { label: t('sap.uploadSteps.qaReview'), state: 'done' },
    { label: t('sap.uploadSteps.sandbox'), state: 'in-progress' },
    { label: t('sap.uploadSteps.production'), state: 'pending' },
  ];

  useEffect(() => {
    api.listSapUploads()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // If real SAP uploads exist, keep them but still show mock WOs for the table
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Derived KPIs
  const totalOrders = orders.length;
  const closedCount = orders.filter((wo) => wo.status === 'TECO' || wo.status === 'CLSD').length;
  const totalCost = orders.reduce((acc, wo) => acc + wo.material_costs + wo.labor_costs, 0);
  const inExecution = orders.filter((wo) => wo.status === 'REL').length;

  // Table totals
  const totalPlanned = orders.reduce((a, wo) => a + wo.planned_work, 0);
  const totalActual = orders.reduce((a, wo) => a + wo.actual_work, 0);
  const totalMaterial = orders.reduce((a, wo) => a + wo.material_costs, 0);
  const totalLabor = orders.reduce((a, wo) => a + wo.labor_costs, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">{t('sap.loadingSAP')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-2xl px-8 py-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Database className="w-7 h-7 text-blue-200" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('sap.title')}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{t('sap.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('sap.connected')}
          </span>
        </div>
      </div>

      {/* Connection status panel */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Link className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{t('sap.connectionParams')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase">{t('common.plant')}</span>
            <span className="text-sm font-bold text-foreground">1000 (JFC-1)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase">{t('sap.client')}</span>
            <span className="text-sm font-bold text-foreground">800</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase">{t('sap.mode')}</span>
            <span className="text-sm font-bold text-foreground">{t('sap.readOnly')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase">{t('common.status')}</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {t('sap.connected')}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* SAP PM Entities */}
        <div className="bg-card rounded-xl border border-blue-100 dark:border-blue-900/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground">{t('sap.sapEntities')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['IE01', 'IL01', 'IW31', 'IP01', 'IA01', 'MIGO'].map((code) => (
              <span key={code} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 font-mono">
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* Key Transactions */}
        <div className="bg-card rounded-xl border border-indigo-100 dark:border-indigo-900/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-foreground">{t('sap.keyTransactions')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['IW38', 'IW39', 'IP10', 'IP17', 'QM01', 'MB51'].map((code) => (
              <span key={code} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 font-mono">
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* Upload Templates */}
        <div className="bg-card rounded-xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">{t('sap.uploadTemplates')}</h3>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('sap.maintenancePlan')}</span>
              <span className="font-bold text-foreground">{t('sap.fieldsCount', { count: 18 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('sap.taskList')}</span>
              <span className="font-bold text-foreground">{t('sap.fieldsCount', { count: 24 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('sap.workPlan')}</span>
              <span className="font-bold text-foreground">{t('sap.fieldsCount', { count: 22 })}</span>
            </div>
            <div className="flex justify-between border-t border-amber-100 dark:border-amber-900/30 pt-1.5 mt-0.5">
              <span className="font-bold text-amber-700 dark:text-amber-400">{t('common.total')}</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{t('sap.fieldsCount', { count: 64 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('sap.reviewedOrders')}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('sap.sapPMOrders')}</p>
        </div>
        <div className="bg-card rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('sap.closedPerTech')}</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{closedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">TECO + CLSD</p>
        </div>
        <div className="bg-card rounded-xl border border-blue-100 dark:border-blue-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('sap.totalCost')}</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">{formatKMAD(totalCost)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('sap.materialPlusLabor')}</p>
        </div>
        <div className="bg-card rounded-xl border border-green-100 dark:border-green-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('sap.inExecution')}</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-1">{inExecution}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('sap.statusRELLabel')}</p>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm mb-6 overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{t('sap.sapPMWorkOrders')}</h2>
        </div>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-muted text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-semibold">{t('sap.woNumber')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('sap.equipmentTag')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('sap.woType')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('common.description')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('sap.sapStatus')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('common.plant')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('sap.start')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('sap.end')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('sap.plannedHours')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('sap.actualHours')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('sap.materialMAD')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('sap.laborMAD')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((wo) => {
              const sapStatus = SAP_STATUS[wo.status] || { label: wo.status, color: 'bg-muted text-foreground border-border' };
              const orderType = ORDER_TYPES[wo.order_type] || wo.order_type;
              const hoursOver = wo.actual_work > wo.planned_work;
              return (
                <tr key={wo.wo_number} className="hover:bg-muted transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">{wo.wo_number}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{wo.equipment_tag}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-foreground">{wo.order_type}</span>
                    <span className="text-muted-foreground ml-1">— {orderType}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-[200px] truncate" title={wo.description}>
                    {wo.description}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border font-semibold ${sapStatus.color}`}>
                      {sapStatus.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{wo.plant}</td>
                  <td className="px-4 py-3 text-muted-foreground">{wo.basic_start}</td>
                  <td className="px-4 py-3 text-muted-foreground">{wo.basic_finish}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{wo.planned_work}h</td>
                  <td className={`px-4 py-3 text-right font-bold ${hoursOver ? 'text-red-600' : 'text-green-600'}`}>
                    {wo.actual_work}h
                    {wo.actual_work !== wo.planned_work && (
                      <span className="text-xs ml-1">
                        ({hoursOver ? '+' : ''}{(wo.actual_work - wo.planned_work).toFixed(1)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">{wo.material_costs.toLocaleString('es-MA')}</td>
                  <td className="px-4 py-3 text-right text-foreground">{wo.labor_costs.toLocaleString('es-MA')}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-muted font-bold text-foreground border-t-2 border-border">
              <td className="px-4 py-3" colSpan={8}>{t('sap.totals')}</td>
              <td className="px-4 py-3 text-right">{totalPlanned}h</td>
              <td className="px-4 py-3 text-right">{totalActual}h</td>
              <td className="px-4 py-3 text-right">{totalMaterial.toLocaleString('es-MA')}</td>
              <td className="px-4 py-3 text-right">{totalLabor.toLocaleString('es-MA')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Upload Process Steps */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Upload className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{t('sap.uploadProcess')}</h2>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {UPLOAD_STEPS.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-3 flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                    ${step.state === 'done' ? 'bg-green-500 text-white' : step.state === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  {step.state === 'done' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-semibold mt-2 text-center
                    ${step.state === 'done' ? 'text-green-600 dark:text-green-400' : step.state === 'in-progress' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
                <span className={`text-xs mt-0.5 font-medium
                  ${step.state === 'done' ? 'text-green-400' : step.state === 'in-progress' ? 'text-blue-400' : 'text-muted-foreground'}
                `}>
                  {step.state === 'done' ? t('common.completed') : step.state === 'in-progress' ? t('sap.inCourse') : t('common.pending')}
                </span>
              </div>
              {idx < UPLOAD_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 hidden md:block ${step.state === 'done' ? 'bg-green-300' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
