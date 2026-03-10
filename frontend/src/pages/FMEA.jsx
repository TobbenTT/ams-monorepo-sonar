import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Microscope, Loader2, Plus, CheckCircle, Upload, Package, Search,
  ChevronDown, ChevronRight, ArrowRight, Sparkles, AlertTriangle, X, FileText
} from 'lucide-react';
import { DataTable, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

/* ─── RPN color helpers ─── */
function rpnColor(value) {
  if (value >= 7) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-300 dark:border-red-700' };
  if (value >= 4) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' };
  return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-300 dark:border-green-700' };
}

function rpnTotalColor(rpn) {
  if (rpn >= 150) return 'text-red-700 dark:text-red-400';
  if (rpn >= 80) return 'text-amber-700 dark:text-amber-400';
  return 'text-green-700 dark:text-green-400';
}

function RpnBox({ label, value }) {
  const c = rpnColor(value);
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border ${c.bg} ${c.border} px-3 py-2 min-w-[56px]`}>
      <span className={`text-2xl font-extrabold ${c.text}`}>{value ?? '—'}</span>
      <span className={`text-[0.65rem] font-bold uppercase tracking-wider mt-0.5 ${c.text}`}>{label}</span>
    </div>
  );
}

/* ─── FMEA Tab keys ─── */
const TABS = ['fmea', 'fmeca', 'tasks', 'workPackages', 'sapUpload'];

/* ─── Task Type Colors ─── */
const TASK_TYPE_COLORS = {
  CBM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  TBM: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  RTF: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
  FTM: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
};

/* ═══════════════════════════════════════════════════════════
   FMEA ANALYSIS TAB
   ═══════════════════════════════════════════════════════════ */
function FmeaAnalysisTab({ records, selectedRecord, onSelect, onAddFunction, onRunDecisions, onGenerateTasks, loading, t }) {
  if (loading) return <LoadingSpinner />;
  const hasUnassigned = records.some(r => !r.task_type);
  const hasStrategies = records.some(r => r.task_type);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onAddFunction}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-medium hover:bg-[#2E7D32] transition-colors"
        >
          <Plus size={16} />
          {t('fmea.addFunction')}
        </button>
        {records.length > 0 && hasUnassigned && onRunDecisions && (
          <button
            onClick={onRunDecisions}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Sparkles size={16} />
            Run RCM Decisions
          </button>
        )}
        {hasStrategies && onGenerateTasks && (
          <button
            onClick={onGenerateTasks}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <FileText size={16} />
            Generate Tasks
          </button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">
          {records.length} {t('fmea.failureModes')}
        </span>
      </div>

      {/* FMEA Table with Component (What) column */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.function')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.component')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.failureMode3Part')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">S</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">O</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">D</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">RPN</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.strategy')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">{t('fmea.noData')}</td></tr>
              ) : records.map((r) => {
                const rpn = r.rpn || (r.severity * r.occurrence * r.detectability);
                const isSelected = selectedRecord?.id === r.id;
                // Parse 3-part failure mode: "What / Mechanism / Cause"
                const fmParts = (r.failure_mode || '').split('/').map(s => s.trim());

                return (
                  <tr
                    key={r.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-muted/30'}`}
                    onClick={() => onSelect(r)}
                  >
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-xs text-foreground truncate block">{r.function || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-foreground">{r.equipment_name?.split(' ').pop() || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {fmParts[0] && <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 px-1.5 py-0.5 rounded">{fmParts[0]}</span>}
                        {fmParts[1] && <><ArrowRight size={10} className="text-muted-foreground" /><span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-1.5 py-0.5 rounded">{fmParts[1]}</span></>}
                        {fmParts[2] && <><ArrowRight size={10} className="text-muted-foreground" /><span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-1.5 py-0.5 rounded">{fmParts[2]}</span></>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold ${rpnColor(r.severity).text}`}>{r.severity}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold ${rpnColor(r.occurrence).text}`}>{r.occurrence}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold ${rpnColor(r.detectability).text}`}>{r.detectability}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${rpn >= 150 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : rpn >= 80 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                        {rpn}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${TASK_TYPE_COLORS[r.task_type] || 'bg-muted text-muted-foreground border-border'}`}>
                        {r.task_type || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FMECA OVERVIEW TAB
   ═══════════════════════════════════════════════════════════ */
function FmecaOverviewTab({ records, t }) {
  const sorted = useMemo(() => [...records].sort((a, b) => {
    const rpnA = a.rpn || (a.severity * a.occurrence * a.detectability);
    const rpnB = b.rpn || (b.severity * b.occurrence * b.detectability);
    return rpnB - rpnA;
  }), [records]);

  const totalRpn = sorted.reduce((sum, r) => sum + (r.rpn || r.severity * r.occurrence * r.detectability), 0);
  const highRpn = sorted.filter(r => (r.rpn || r.severity * r.occurrence * r.detectability) >= 150).length;
  const medRpn = sorted.filter(r => { const v = r.rpn || r.severity * r.occurrence * r.detectability; return v >= 80 && v < 150; }).length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('fmea.totalFailureModes')}</div>
          <div className="text-2xl font-bold text-foreground">{records.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('fmea.avgRpn')}</div>
          <div className={`text-2xl font-bold ${rpnTotalColor(records.length > 0 ? totalRpn / records.length : 0)}`}>
            {records.length > 0 ? Math.round(totalRpn / records.length) : 0}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="text-xs text-red-600 dark:text-red-400 mb-1">{t('fmea.highRpn')}</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{highRpn}</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">{t('fmea.moderateRpn')}</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{medRpn}</div>
        </div>
      </div>

      {/* RPN heatmap sorted list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">{t('fmea.rpnRanking')}</h3>
        </div>
        <div className="divide-y divide-border">
          {sorted.map((r, i) => {
            const rpn = r.rpn || (r.severity * r.occurrence * r.detectability);
            return (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{r.equipment_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.failure_mode}</div>
                </div>
                <div className="flex items-center gap-2">
                  <RpnBox label="S" value={r.severity} />
                  <span className="text-muted-foreground">×</span>
                  <RpnBox label="O" value={r.occurrence} />
                  <span className="text-muted-foreground">×</span>
                  <RpnBox label="D" value={r.detectability} />
                  <span className="text-muted-foreground">=</span>
                  <div className={`text-lg font-extrabold ${rpnTotalColor(rpn)} w-12 text-center`}>{rpn}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAINTENANCE TASKS TAB
   ═══════════════════════════════════════════════════════════ */
function TasksTab({ tasks, selectedEquipment, t }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const filtered = selectedEquipment
    ? tasks.filter(tk => tk.equipment_tag === selectedEquipment)
    : tasks;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{filtered.length} {t('fmea.maintenanceTasks')}</span>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm ${selectedTask ? 'flex-[1_1_60%]' : 'flex-1'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('common.equipment')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('common.description')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('common.type')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.frequency')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.duration')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('fmea.resource')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">{t('fmea.noTasks')}</td></tr>
                ) : filtered.map((tk) => (
                  <tr key={tk.task_id} onClick={() => setSelectedTask(selectedTask?.task_id === tk.task_id ? null : tk)}
                    className={`cursor-pointer transition-colors ${selectedTask?.task_id === tk.task_id ? 'bg-[#1B5E20]/10 dark:bg-green-900/20' : 'hover:bg-muted/30'}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tk.task_id}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{tk.equipment_tag}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{tk.task_description}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${TASK_TYPE_COLORS[tk.type] || 'bg-muted text-muted-foreground border-border'}`}>
                        {tk.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{tk.frequency}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{tk.duration_h}h</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{tk.resource}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">{tk.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <div className="flex-[0_0_35%] min-w-0 bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">Task Details</h3>
              <button onClick={() => setSelectedTask(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Task ID</span>
                <span className="text-sm font-mono text-foreground">{selectedTask.task_id}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">{t('common.equipment')}</span>
                <span className="text-sm font-medium text-foreground">{selectedTask.equipment_tag}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">{t('common.description')}</span>
                <span className="text-sm text-foreground">{selectedTask.name}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">{t('common.type')}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${TASK_TYPE_COLORS[selectedTask.type] || 'bg-muted text-muted-foreground border-border'}`}>
                    {selectedTask.task_type}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">{t('common.status')}</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">{selectedTask.status}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">{t('fmea.frequency')}</span>
                  <span className="text-sm text-foreground">{selectedTask.frequency || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">{t('fmea.duration')}</span>
                  <span className="text-sm text-foreground">{selectedTask.duration_h}h</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Constraint</span>
                <span className="text-sm text-foreground">{selectedTask.constraint || '—'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">{t('fmea.resource')}</span>
                <span className="text-sm text-foreground">{selectedTask.resource || '—'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WORK PACKAGES TAB
   ═══════════════════════════════════════════════════════════ */
function WorkPackagesTab({ tasks, t }) {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [wpName, setWpName] = useState('');
  const [building, setBuilding] = useState(false);
  const [builtPkg, setBuiltPkg] = useState(null);
  const toast = useToast();

  function toggleTask(taskId) {
    setSelectedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  }

  async function handleBuild() {
    if (selectedTasks.length === 0) return;
    setBuilding(true);
    try {
      const result = await api.createWorkPackage({
        name: wpName || `WP-${Date.now()}`,
        task_ids: selectedTasks,
      });
      setBuiltPkg(result);
      toast.success(t('fmea.wpCreated'));
    } catch {
      toast.error(t('fmea.wpError') || 'Error creating work package');
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">{t('fmea.buildWorkPackage')}</h3>
        <div className="flex items-center gap-3 mb-4">
          <input
            value={wpName}
            onChange={e => setWpName(e.target.value)}
            placeholder={t('fmea.wpNamePlaceholder')}
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
          />
          <button
            onClick={handleBuild}
            disabled={selectedTasks.length === 0 || building}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-sm font-medium hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
          >
            {building ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
            {t('fmea.buildWp')} ({selectedTasks.length})
          </button>
        </div>

        {/* Task selection */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {tasks.map(tk => (
            <label key={tk.task_id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedTasks.includes(tk.task_id)
                ? 'border-[#1B5E20] bg-green-50 dark:bg-green-900/20'
                : 'border-border hover:bg-muted/30'
            }`}>
              <input
                type="checkbox"
                checked={selectedTasks.includes(tk.task_id)}
                onChange={() => toggleTask(tk.task_id)}
                className="accent-[#1B5E20] w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{tk.task_id}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${TASK_TYPE_COLORS[tk.type] || ''}`}>{tk.type}</span>
                </div>
                <div className="text-sm text-foreground">{tk.task_description}</div>
                <div className="text-xs text-muted-foreground">{tk.equipment_tag} · {tk.frequency} · {tk.duration_h}h</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {builtPkg && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800 dark:text-green-300">{t('fmea.wpCreated')}</span>
          </div>
          <div className="text-sm text-green-700 dark:text-green-400">
            {builtPkg.name} — {builtPkg.tasks || selectedTasks.length} {t('fmea.tasksIncluded')} · {builtPkg.total_hours || 0}h {t('fmea.totalEstimated')}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SAP UPLOAD TAB
   ═══════════════════════════════════════════════════════════ */
function SapUploadTab({ t, plant }) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const toast = useToast();

  async function handleGenerate() {
    setUploading(true);
    try {
      const result = await api.generateSapUpload({
        plant_code: plant || 'OCP-JFC1',
        maintenance_plan: {},
        maintenance_items: [],
        task_lists: [],
      });
      setUploadResult(result);
      toast.success(t('fmea.sapGenerated'));
    } catch {
      toast.error(t('fmea.sapError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-lg font-bold text-foreground mb-2">{t('fmea.sapUploadTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{t('fmea.sapUploadDesc')}</p>
        <button
          onClick={handleGenerate}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-50 transition-colors mx-auto"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {t('fmea.generateSapFile')}
        </button>
      </div>

      {uploadResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800 dark:text-green-300">{t('fmea.sapReady')}</span>
          </div>
          <div className="text-sm text-green-700 dark:text-green-400">
            {uploadResult.format} — {uploadResult.records} records · {t('common.status')}: {uploadResult.status}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAIL SIDEBAR
   ═══════════════════════════════════════════════════════════ */
function DetailSidebar({ record, onClose, t }) {
  if (!record) return null;

  const rpn = record.rpn || (record.severity * record.occurrence * record.detectability);
  const fmParts = (record.failure_mode || '').split('/').map(s => s.trim());

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">{t('fmea.failureModeDetail')}</div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
      </div>

      {/* Equipment */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-0.5">{t('common.equipment')}</div>
        <div className="text-sm font-semibold text-foreground">{record.equipment_name}</div>
        <div className="text-xs font-mono text-muted-foreground">{record.equipment_tag}</div>
      </div>

      {/* Function */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-0.5">{t('fmea.function')}</div>
        <div className="text-sm text-foreground">{record.function || '—'}</div>
      </div>

      {/* 3-Part Failure Mode */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1">{t('fmea.failureMode3Part')}</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground w-16">What</span>
            <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 px-2 py-0.5 rounded">{fmParts[0] || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground w-16">Mechanism</span>
            <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded">{fmParts[1] || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground w-16">Cause</span>
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2 py-0.5 rounded">{fmParts[2] || '—'}</span>
          </div>
        </div>
      </div>

      {/* Effects */}
      <div className="mb-3 space-y-1.5">
        <div className="text-xs text-muted-foreground">{t('fmea.failureEffects')}</div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
          <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block mb-0.5">{t('fmea.localEffect')}</span>
          <p className="text-xs text-amber-900 dark:text-amber-300">{record.failure_effect_local || '—'}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
          <span className="text-[10px] font-bold uppercase text-red-700 dark:text-red-400 block mb-0.5">{t('fmea.systemEffect')}</span>
          <p className="text-xs text-red-900 dark:text-red-300">{record.failure_effect_system || '—'}</p>
        </div>
      </div>

      {/* RPN Breakdown */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-2">{t('fmea.rpnBreakdown')}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <RpnBox label="S" value={record.severity} />
          <span className="text-muted-foreground font-bold">×</span>
          <RpnBox label="O" value={record.occurrence} />
          <span className="text-muted-foreground font-bold">×</span>
          <RpnBox label="D" value={record.detectability} />
          <span className="text-muted-foreground font-bold">=</span>
          <div className={`text-xl font-extrabold ${rpnTotalColor(rpn)}`}>{rpn}</div>
        </div>
      </div>

      {/* Current Controls */}
      {record.current_controls && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-0.5">{t('fmea.currentControls')}</div>
          <p className="text-xs text-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">{record.current_controls}</p>
        </div>
      )}

      {/* Recommended Action */}
      {record.recommended_action && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-0.5">{t('fmea.recommendedAction')}</div>
          <p className="text-xs text-foreground bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2">{record.recommended_action}</p>
        </div>
      )}

      {/* Task Type + Frequency */}
      {(record.task_type || record.frequency) && (
        <div className="flex gap-2 flex-wrap">
          {record.task_type && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TASK_TYPE_COLORS[record.task_type] || ''}`}>{record.task_type}</span>}
          {record.frequency && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{record.frequency}</span>}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADD FAILURE MODE ROW FORM
   ═══════════════════════════════════════════════════════════ */
function AddRowForm({ onSubmit, onCancel, t }) {
  const [form, setForm] = useState({
    function_description: '',
    failure_mode: '',
    failure_effect: '',
    severity: 5,
    occurrence: 3,
    detection: 5,
    failure_consequence: 'EVIDENT_OPERATIONAL',
    recommended_action: '',
  });

  const rpn = form.severity * form.occurrence * form.detection;

  return (
    <div className="bg-card border-2 border-[#1B5E20]/30 rounded-xl p-5 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">
          {t('fmea.addFailureMode') || 'Add Failure Mode'}
        </h3>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('fmea.function') || 'Function'}</label>
          <input value={form.function_description} onChange={e => setForm(f => ({ ...f, function_description: e.target.value }))}
            placeholder="e.g. Transfer fluid from suction to discharge"
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('fmea.failureMode3Part') || 'Failure Mode (What / Mechanism / Cause)'}</label>
          <input value={form.failure_mode} onChange={e => setForm(f => ({ ...f, failure_mode: e.target.value }))}
            placeholder="e.g. Bearing seizure / Overheating / Contamination"
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('fmea.failureEffect') || 'Failure Effect'}</label>
          <input value={form.failure_effect} onChange={e => setForm(f => ({ ...f, failure_effect: e.target.value }))}
            placeholder="e.g. Loss of flow, production downtime"
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('fmea.recommendedAction') || 'Recommended Action'}</label>
          <input value={form.recommended_action} onChange={e => setForm(f => ({ ...f, recommended_action: e.target.value }))}
            placeholder="e.g. Implement vibration monitoring CBM"
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground">S</label>
          <input type="number" min={1} max={10} value={form.severity} onChange={e => setForm(f => ({ ...f, severity: +e.target.value }))}
            className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm" />
        </div>
        <span className="text-muted-foreground font-bold">x</span>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground">O</label>
          <input type="number" min={1} max={10} value={form.occurrence} onChange={e => setForm(f => ({ ...f, occurrence: +e.target.value }))}
            className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm" />
        </div>
        <span className="text-muted-foreground font-bold">x</span>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground">D</label>
          <input type="number" min={1} max={10} value={form.detection} onChange={e => setForm(f => ({ ...f, detection: +e.target.value }))}
            className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm" />
        </div>
        <span className="text-muted-foreground font-bold">=</span>
        <span className={`text-lg font-extrabold ${rpn >= 150 ? 'text-red-700' : rpn >= 80 ? 'text-amber-700' : 'text-green-700'}`}>{rpn}</span>
        <span className="text-xs text-muted-foreground">RPN</span>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSubmit(form)} disabled={!form.failure_mode}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg text-sm font-medium hover:bg-[#2E7D32] disabled:opacity-50 transition-colors">
          <Plus size={16} /> {t('fmea.addRow') || 'Add Failure Mode'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
          {t('common.cancel') || 'Cancel'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function FMEA() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('fmea');
  const [nodes, setNodes] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [records, setRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [worksheetId, setWorksheetId] = useState(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [creating, setCreating] = useState(false);

  function loadRecords() {
    api.listFmecaWorksheets({ plant_id: plant })
      .then(ws => {
        if (Array.isArray(ws)) {
          const real = ws.filter(r => !r._is_empty_worksheet);
          setRecords(real);
          // Track worksheet ID from any entry (including empty placeholders)
          const anyWs = ws.find(r => r.worksheet_id);
          if (anyWs) setWorksheetId(anyWs.worksheet_id);
        }
      })
      .catch(() => {});
  }

  /* Load equipment nodes, FMECA records and tasks */
  useEffect(() => {
    api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' })
      .then(n => {
        if (Array.isArray(n) && n.length > 0) {
          setNodes(n);
          // Auto-select if only one equipment
          if (n.length === 1) setSelectedEquipment(n[0].code || n[0].node_id);
        } else {
          setNodes([]);
        }
      })
      .catch(() => setNodes([]));
    loadRecords();
    api.listTasks({ plant_id: plant })
      .then(t => { if (Array.isArray(t)) setTasks(t); })
      .catch(() => {});
  }, [plant]);

  /* Create FMECA worksheet for selected equipment */
  async function handleCreateWorksheet() {
    let target = nodes.find(n => (n.code || n.node_id) === selectedEquipment);
    // If nothing selected, auto-pick the only equipment or ask user to pick
    if (!target) {
      if (nodes.length === 1) {
        target = nodes[0];
        setSelectedEquipment(target.code || target.node_id);
      } else if (nodes.length > 1) {
        toast.warning(t('fmea.selectEquipmentFirst') || 'Select an equipment first');
        return;
      } else {
        toast.warning('No equipment nodes found');
        return;
      }
    }
    setCreating(true);
    try {
      const res = await api.createFmecaWorksheet({
        equipment_id: target.node_id,
        equipment_tag: target.code || target.node_id,
        equipment_name: target.name,
        analyst: 'admin',
      });
      setWorksheetId(res.worksheet_id);
      toast.success(t('fmea.worksheetCreated') || 'FMECA worksheet created');
      loadRecords();
    } catch {
      toast.error(t('fmea.worksheetError') || 'Error creating worksheet');
    } finally {
      setCreating(false);
    }
  }

  /* Run RCM decision logic on all rows */
  async function handleRunDecisions() {
    if (!worksheetId) return;
    try {
      await api.runFmecaDecisions(worksheetId);
      toast.success('RCM strategies assigned');
      loadRecords();
    } catch {
      toast.error('Error running RCM decisions');
    }
  }

  /* Generate maintenance tasks from FMECA strategies */
  async function handleGenerateTasks() {
    if (!worksheetId) return;
    try {
      const res = await api.generateFmecaTasks(worksheetId);
      toast.success(`${res.tasks_created} maintenance tasks generated`);
      // Reload tasks
      api.listTasks({ plant_id: plant })
        .then(t => { if (Array.isArray(t)) setTasks(t); })
        .catch(() => {});
    } catch {
      toast.error('Error generating tasks');
    }
  }

  /* Add a failure mode row to the current worksheet */
  async function handleAddRow(rowData) {
    if (!worksheetId) {
      toast.warning(t('fmea.createWorksheetFirst') || 'Create a worksheet first');
      return;
    }
    try {
      await api.addFmecaRow(worksheetId, rowData);
      toast.success(t('fmea.rowAdded') || 'Failure mode added');
      setShowAddRow(false);
      loadRecords();
    } catch {
      toast.error(t('fmea.rowError') || 'Error adding failure mode');
    }
  }

  /* Filter records by equipment */
  const filteredRecords = useMemo(() => {
    if (!selectedEquipment) return records;
    return records.filter(r => r.equipment_tag === selectedEquipment);
  }, [records, selectedEquipment]);

  const filteredTasks = useMemo(() => {
    if (!selectedEquipment) return tasks;
    return tasks.filter(tk => tk.equipment_tag === selectedEquipment);
  }, [tasks, selectedEquipment]);

  const tabLabels = {
    fmea: t('fmea.tabFmea'),
    fmeca: t('fmea.tabFmeca'),
    tasks: t('fmea.tabTasks'),
    workPackages: t('fmea.tabWorkPackages'),
    sapUpload: t('fmea.tabSapUpload'),
  };

  const tabIcons = {
    fmea: Microscope,
    fmeca: AlertTriangle,
    tasks: FileText,
    workPackages: Package,
    sapUpload: Upload,
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Microscope size={22} className="text-purple-700 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('fmea.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('fmea.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Equipment Selector */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted-foreground" />
            <select
              className="w-[300px] px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20]"
              value={selectedEquipment}
              onChange={e => setSelectedEquipment(e.target.value)}
            >
              <option value="">{t('fmea.allEquipment')}</option>
              {nodes.map(n => <option key={n.node_id} value={n.code || n.node_id}>{n.code || n.node_id} — {n.name}</option>)}
            </select>
          </div>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} {t('fmea.failureModes')} · {filteredTasks.length} {t('fmea.tasks')}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border mb-5 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-card border border-border border-b-card text-[#1B5E20] dark:text-green-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex gap-5 flex-col lg:flex-row">
        <div className={selectedRecord && activeTab === 'fmea' ? 'flex-[1_1_65%]' : 'flex-1'}>
          {activeTab === 'fmea' && (
            <>
              {/* Create FMECA / Add Failure Mode buttons */}
              {records.length === 0 && !worksheetId && nodes.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6 mb-4 text-center">
                  <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-foreground mb-1">{t('fmea.noWorksheet') || 'No FMECA analysis yet'}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('fmea.createWorksheetHint') || 'Create a worksheet to start analyzing failure modes for this equipment.'}</p>
                  <button onClick={handleCreateWorksheet} disabled={creating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B5E20] text-white rounded-lg text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-50 transition-colors">
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {t('fmea.createAnalysis') || 'Create FMECA Analysis'}
                  </button>
                </div>
              )}
              {showAddRow && (
                <AddRowForm onSubmit={handleAddRow} onCancel={() => setShowAddRow(false)} t={t} />
              )}
              <FmeaAnalysisTab
                records={filteredRecords}
                selectedRecord={selectedRecord}
                onSelect={setSelectedRecord}
                onAddFunction={() => worksheetId ? setShowAddRow(true) : handleCreateWorksheet()}
                onRunDecisions={worksheetId ? handleRunDecisions : null}
                onGenerateTasks={worksheetId ? handleGenerateTasks : null}
                loading={loading}
                t={t}
              />
            </>
          )}
          {activeTab === 'fmeca' && <FmecaOverviewTab records={filteredRecords} t={t} />}
          {activeTab === 'tasks' && <TasksTab tasks={filteredTasks} selectedEquipment={selectedEquipment} t={t} />}
          {activeTab === 'workPackages' && <WorkPackagesTab tasks={tasks} t={t} />}
          {activeTab === 'sapUpload' && <SapUploadTab t={t} plant={plant} />}
        </div>

        {/* Detail sidebar */}
        {selectedRecord && activeTab === 'fmea' && (
          <div className="flex-[0_0_33%] min-w-0">
            <DetailSidebar record={selectedRecord} onClose={() => setSelectedRecord(null)} t={t} />
          </div>
        )}
      </div>
    </div>
  );
}
