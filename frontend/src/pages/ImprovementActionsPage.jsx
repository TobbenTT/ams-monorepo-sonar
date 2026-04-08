import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle, Inbox, Plus, BarChart3, Pencil, Trash2, CheckCircle, Play, X as XIcon, Zap, ShoppingCart } from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

// ── Helpers ──────────────────────────────────────────────────────────

const SOURCE_COLORS = {
  manual: 'bg-gray-100 text-gray-800 border-gray-300',
  rca: 'bg-purple-100 text-purple-800 border-purple-300',
  deviation: 'bg-orange-100 text-orange-800 border-orange-300',
  work_request: 'bg-blue-100 text-blue-800 border-blue-300',
  capa: 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

const STATUS_COLORS = {
  OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
};

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

function getSourceColor(type) {
  return SOURCE_COLORS[(type || '').toLowerCase()] || SOURCE_COLORS.manual;
}
function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.OPEN;
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const EMPTY_FORM = {
  title: '', description: '', action_type: 'CORRECTIVE', priority: 'MEDIUM',
  category: '', assigned_to: '', target_date: '', notes: '',
  source_type: 'MANUAL', source_ref: '', equipment_tag: '',
};

// ── Main Component ──────────────────────────────────────────────────

export default function ImprovementActionsPage() {
  const { selectedPlant } = useOutletContext();
  const { t } = useLanguage();
  const toast = useToast();
  const plantId = selectedPlant?.plant_id || selectedPlant || 'OCP-JFC1';

  const [activeModule, setActiveModule] = useState('acciones'); // 'acciones' | 'hallazgos'
  const [hallazgos, setFindings] = useState([]);
    const [automaticCreation, setAutomaticCreation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actions, setActions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, in_progress: 0, completed: 0, overdue: 0 });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null); // null = create, object = edit
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Translated label maps (inside component so t() is available) ──
  const SOURCE_LABELS = {
    MANUAL: t('improvementActions.sourceManual'),
    RCA: t('improvementActions.sourceRca'),
    DEVIATION: t('improvementActions.sourceDeviation'),
    WORK_REQUEST: t('improvementActions.sourceWorkRequest'),
    CAPA: t('improvementActions.sourceCapa'),
  };

  const STATUS_LABELS = {
    OPEN: t('improvementActions.statusOpen'),
    IN_PROGRESS: t('improvementActions.statusInProgress'),
    COMPLETED: t('improvementActions.statusCompleted'),
    VERIFIED: t('improvementActions.statusVerified'),
    CANCELLED: t('improvementActions.statusCancelled'),
  };

  const PRIORITY_LABELS = {
    LOW: t('improvementActions.priorityLow'),
    MEDIUM: t('improvementActions.priorityMedium'),
    HIGH: t('improvementActions.priorityHigh'),
    CRITICAL: t('improvementActions.priorityCritical'),
  };

  function getSourceLabel(type) {
    return SOURCE_LABELS[(type || '').toUpperCase()] || SOURCE_LABELS.MANUAL;
  }

  // ── Fetch ──
  async function fetchActions() {
    try {
      setLoading(true);
      setError(null);
      const [actionsRes, summaryRes, hallazgosRes] = await Promise.all([
        api.listImprovementActions({ plant_id: plantId }).catch(() => ({ items: [] })),
        api.getImprovementActionsSummary({ plant_id: plantId }).catch(() => ({})),
        api.listWorkRequests({ plant_id: plantId, limit: 100 }).catch(() => []),
      ]);
      setActions(actionsRes?.items || []);
      setSummary(summaryRes || {});
      const wrItems = Array.isArray(hallazgosRes) ? hallazgosRes : (hallazgosRes?.items || []);
      setFindings(wrItems.filter(r => !['COMPLETED','CLOSED','CANCELLED','REJECTED'].includes(r.status)));
    } catch (err) {
      setError(err.message || t('improvementActions.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchActions(); }, [plantId]);

  // ── Create / Edit ──
  function openCreate(defaults = {}) {
    setEditingAction(null);
    setForm({ ...EMPTY_FORM, ...defaults });
    setModalOpen(true);
  }

  function openEdit(action) {
    setEditingAction(action);
    setForm({
      title: action.title || '',
      description: action.description || '',
      action_type: action.action_type || 'CORRECTIVE',
      priority: action.priority || 'MEDIUM',
      category: action.category || '',
      assigned_to: action.assigned_to || '',
      target_date: action.target_date || '',
      notes: action.notes || '',
      source_type: action.source_type || 'MANUAL',
      source_ref: action.source_ref || '',
      equipment_tag: action.equipment_tag || '',
      resolution: action.resolution || '',
      status: action.status || 'OPEN',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingAction) {
        await api.updateImprovementAction(editingAction.action_id, form);
      } else {
        await api.createImprovementAction({ ...form, plant_id: plantId });
      }
      setModalOpen(false);
      fetchActions();
    } catch (err) {
      toast.error('Error: ' + (err.message || t('improvementActions.failedToLoad')));
    } finally {
      setSaving(false);
    }
  }

  // ── Quick status change ──
  async function setStatus(action, newStatus) {
    try {
      await api.updateImprovementAction(action.action_id, { status: newStatus });
      fetchActions();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  }

  // ── Delete ──
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.deleteImprovementAction(deleteTarget.action_id);
      setDeleteTarget(null);
      fetchActions();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  }

  // ── Analyze Deviations ──
  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const result = await api.analyzeDeviations(plantId);
      const msg = result.actions_created > 0
        ? t('improvementActions.analysisCreated', { wrs: result.analyzed_wrs, created: result.actions_created })
        : t('improvementActions.analysisNone', { wrs: result.analyzed_wrs });
      toast.success(msg);
      fetchActions();
    } catch (err) {
      toast.error('Error: ' + (err.message || t('improvementActions.failedToLoad')));
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Derived ──
  const trendDataUp = Array.from({ length: 10 }, (_, i) => ({ value: 12 + i * 0.6 }));
  const trendDataDown = Array.from({ length: 10 }, (_, i) => ({ value: 8 - i * 0.3 }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">{t('improvementActions.loadingActions')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={fetchActions}>{t('improvementActions.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="w-7 h-7" />
              {t('improvementActions.aiDetectionCenter')}
            </h1>
            <p className="text-blue-100 text-sm mt-1">Track and manage continuous improvement actions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/80">{t('improvementActions.automaticActionCreation')}</span>
              <button
                onClick={() => setAutomaticCreation(!automaticCreation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automaticCreation ? 'bg-white/40' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automaticCreation ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <Button
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 flex items-center gap-2"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              {analyzing ? t('improvementActions.analyzing') : t('improvementActions.analyzeWeeklyDeviations')}
            </Button>
          </div>
        </div>
      </div>

      {/* Module Tab Switcher */}
      <div className="flex border-b border-gray-200 mb-2">
        <button
          onClick={() => setActiveModule('acciones')}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-colors ${activeModule === 'acciones' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Acciones de Mejora
        </button>
        <button
          onClick={() => setActiveModule('hallazgos')}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-colors ${activeModule === 'hallazgos' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Findings / Avisos
          {hallazgos.length > 0 && <span className="ml-1.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{hallazgos.length}</span>}
        </button>
      </div>

      {activeModule === 'hallazgos' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Findings y Avisos de Trabajo</h2>
            <span className="text-sm text-gray-400">{hallazgos.length} hallazgos activos</span>
          </div>
          <div className="grid gap-3">
            {hallazgos.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
                <p className="text-4xl mb-3 opacity-40">🔍</p>
                <p className="font-medium">Sin hallazgos activos</p>
              </div>
            ) : hallazgos.map(h => {
              const pColor = { P1: 'bg-red-100 text-red-700 border-red-300', P2: 'bg-orange-100 text-orange-700 border-orange-300', P3: 'bg-yellow-100 text-yellow-700 border-yellow-300', P4: 'bg-blue-100 text-blue-700 border-blue-300' };
              const sColor = { PENDING_VALIDATION: 'bg-amber-50 text-amber-700', VALIDATED: 'bg-emerald-50 text-emerald-700', IN_PROGRESS: 'bg-blue-50 text-blue-700', COMPLETED: 'bg-purple-50 text-purple-700' };
              const sLabel = { PENDING_VALIDATION: 'Pending', VALIDATED: 'Approved', IN_PROGRESS: 'En Ejecución', COMPLETED: 'Completed', REJECTED: 'Rejected' };
              return (
                <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{h.id?.slice(0, 10)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${pColor[h.priority_requested] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                          {h.priority_requested || '—'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${sColor[h.status] || 'bg-gray-50 text-gray-600'}`}>
                          {sLabel[h.status] || h.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{h.failure_description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>🏭 {h.equipment_name || h.equipment_tag}</span>
                        {h.created_at && <span>📅 {new Date(h.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                        {h.failure_category && <span>🏷️ {h.failure_category}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {h.ai_confidence && (
                        <div className="text-xs text-gray-400 mb-1">IA: {Math.round(h.ai_confidence * 100)}%</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">

      {/* Main Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('improvementActions.pageTitle')}
        </h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" onClick={() => openCreate()}>
          <Plus className="w-4 h-4" />
          {t('improvementActions.createAction')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 bg-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{t('improvementActions.totalActions')}</p>
            <p className="text-4xl font-bold text-gray-900">{summary.total || 0}</p>
          </div>
        </Card>
        <Card className="p-6 bg-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{t('improvementActions.inProgress')}</p>
            <p className="text-4xl font-bold text-gray-900">{(summary.in_progress || 0) + (summary.open || 0)}</p>
          </div>
          {(summary.in_progress || 0) > 0 && (
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={trendDataUp}>
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-6 bg-white border-l-4 border-red-500">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{t('improvementActions.overdue')}</p>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold text-red-600">{summary.overdue || 0}</p>
              {(summary.overdue || 0) > 0 && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
            </div>
          </div>
          {(summary.overdue || 0) > 0 && (
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={trendDataDown}>
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-6 bg-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{t('improvementActions.completed')}</p>
            <p className="text-4xl font-bold text-gray-900">{summary.completed || 0}</p>
          </div>
        </Card>
      </div>

      {/* Main Content: Table + AI Panel side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Table */}
        <Card className="p-6 bg-white">
          {actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Inbox className="w-12 h-12" />
              <p className="text-lg font-medium">{t('improvementActions.noActionsYet')}</p>
              <p className="text-sm">{t('improvementActions.emptyHint')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">{t('improvementActions.title')}</TableHead>
                    <TableHead className="font-semibold">{t('improvementActions.source')}</TableHead>
                    <TableHead className="font-semibold">{t('improvementActions.priority')}</TableHead>
                    <TableHead className="font-semibold">{t('improvementActions.assignedTo')}</TableHead>
                    <TableHead className="font-semibold">{t('improvementActions.dueDate')}</TableHead>
                    <TableHead className="font-semibold">{t('improvementActions.status')}</TableHead>
                    <TableHead className="font-semibold text-right">{t('improvementActions.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map((action) => (
                    <TableRow key={action.action_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(action)}>
                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-2">
                          {action.ai_generated && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[10px] px-1.5 py-0 flex-shrink-0">AI</Badge>
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">{action.title}</p>
                            {action.equipment_tag && (
                              <p className="text-xs text-gray-500 mt-0.5">{action.equipment_tag}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSourceColor(action.source_type)}>{getSourceLabel(action.source_type)}</Badge>
                        {action.source_ref && <p className="text-xs text-gray-500 mt-0.5">{action.source_ref}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.MEDIUM}>{PRIORITY_LABELS[action.priority] || PRIORITY_LABELS.MEDIUM}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                            {initials(action.assigned_to || action.created_by)}
                          </div>
                          <span className="text-sm">{action.assigned_to || action.created_by || '\u2014'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${action.is_overdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {action.target_date || '\u2014'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(action.status)}>{STATUS_LABELS[action.status] || action.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {action.status === 'OPEN' && (
                            <button onClick={() => setStatus(action, 'IN_PROGRESS')} className="p-1.5 hover:bg-blue-50 rounded" title={t('improvementActions.start')}>
                              <Play className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                          )}
                          {action.status === 'IN_PROGRESS' && (
                            <button onClick={() => setStatus(action, 'COMPLETED')} className="p-1.5 hover:bg-green-50 rounded" title={t('improvementActions.complete')}>
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            </button>
                          )}
                          <button onClick={() => openEdit(action)} className="p-1.5 hover:bg-gray-100 rounded" title={t('common.edit')}>
                            <Pencil className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button onClick={() => setDeleteTarget(action)} className="p-1.5 hover:bg-red-50 rounded" title={t('common.delete')}>
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* AI Panel - RIGHT SIDE */}
        <div className="space-y-3">
          {/* Adjust Planning Standards */}
          <Card
            className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => openCreate({
              title: t('improvementActions.adjustPlanningActionTitle'),
              description: t('improvementActions.adjustPlanningActionDesc'),
              category: 'Planning',
              action_type: 'IMPROVEMENT',
              priority: 'MEDIUM',
              source_type: 'DEVIATION',
              ai_generated: true,
            })}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{t('improvementActions.adjustPlanningTitle')}</h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  {t('improvementActions.adjustPlanningDesc')}
                </p>
              </div>
            </div>
          </Card>

          {/* Request Spare Parts */}
          <Card
            className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => openCreate({
              title: t('improvementActions.requestSparePartsActionTitle'),
              description: t('improvementActions.requestSparePartsActionDesc'),
              category: 'Spare Parts',
              action_type: 'CORRECTIVE',
              priority: 'HIGH',
              source_type: 'DEVIATION',
              ai_generated: true,
            })}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{t('improvementActions.requestSparePartsTitle')}</h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  {t('improvementActions.requestSparePartsDesc')}
                </p>
              </div>
            </div>
          </Card>

          {/* Insights Panel */}
          <Card className="p-4 bg-white shadow-lg border-l-4 border-emerald-500">
            <h4 className="font-bold text-sm text-gray-900 mb-3">{t('improvementActions.aiInsights')}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-gray-700">
                  {summary.total > 0
                    ? t('improvementActions.insightsTotalActions', { total: summary.total, overdue: summary.overdue || 0 })
                    : t('improvementActions.insightsNoActions')}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-gray-700">
                  {summary.completed > 0
                    ? t('improvementActions.insightsCompleted', { count: summary.completed })
                    : t('improvementActions.insightsNoCompleted')}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-900 mb-2">{t('improvementActions.recommendedAction')}</p>
                <p className="text-xs text-gray-700">
                  {summary.overdue > 0
                    ? t('improvementActions.insightsOverdueFocus')
                    : t('improvementActions.insightsOnTrack')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Create/Edit Modal ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAction ? t('improvementActions.editAction') : t('improvementActions.createImprovementAction')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.titleLabel')}</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={t('improvementActions.titlePlaceholder')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.descriptionLabel')}</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t('improvementActions.descriptionPlaceholder')}
              />
            </div>

            {/* Row: Type + Priority + Category */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.typeLabel')}</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.action_type} onChange={(e) => setForm(f => ({ ...f, action_type: e.target.value }))}>
                  <option value="CORRECTIVE">{t('improvementActions.typeCorrective')}</option>
                  <option value="PREVENTIVE">{t('improvementActions.typePreventive')}</option>
                  <option value="IMPROVEMENT">{t('improvementActions.typeImprovement')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.priorityLabel')}</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="LOW">{t('improvementActions.priorityLow')}</option>
                  <option value="MEDIUM">{t('improvementActions.priorityMedium')}</option>
                  <option value="HIGH">{t('improvementActions.priorityHigh')}</option>
                  <option value="CRITICAL">{t('improvementActions.priorityCritical')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.categoryLabel')}</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">{t('improvementActions.categorySelect')}</option>
                  <option value="Reliability">{t('improvementActions.categoryReliability')}</option>
                  <option value="Planning">{t('improvementActions.categoryPlanning')}</option>
                  <option value="Spare Parts">{t('improvementActions.categorySpareParts')}</option>
                  <option value="Procedures">{t('improvementActions.categoryProcedures')}</option>
                  <option value="Training">{t('improvementActions.categoryTraining')}</option>
                  <option value="Safety">{t('improvementActions.categorySafety')}</option>
                  <option value="Other">{t('improvementActions.categoryOther')}</option>
                </select>
              </div>
            </div>

            {/* Row: Assigned To + Due Date + Equipment */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.assignedToLabel')}</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.assigned_to}
                  onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  placeholder={t('improvementActions.assignedToPlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.targetDateLabel')}</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.target_date}
                  onChange={(e) => setForm(f => ({ ...f, target_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.equipmentTagLabel')}</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.equipment_tag}
                  onChange={(e) => setForm(f => ({ ...f, equipment_tag: e.target.value }))}
                  placeholder={t('improvementActions.equipmentTagPlaceholder')}
                />
              </div>
            </div>

            {/* Source info (read-only for AI-generated) */}
            {(form.source_type !== 'MANUAL' || editingAction?.source_type !== 'MANUAL') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.sourceTypeLabel')}</label>
                  <input className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50" value={form.source_type} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.sourceRefLabel')}</label>
                  <input className="w-full border rounded-md px-3 py-2 text-sm" value={form.source_ref} onChange={(e) => setForm(f => ({ ...f, source_ref: e.target.value }))} />
                </div>
              </div>
            )}

            {/* Status (only for edit) */}
            {editingAction && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.statusLabel')}</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="OPEN">{t('improvementActions.statusOpen')}</option>
                    <option value="IN_PROGRESS">{t('improvementActions.statusInProgress')}</option>
                    <option value="COMPLETED">{t('improvementActions.statusCompleted')}</option>
                    <option value="VERIFIED">{t('improvementActions.statusVerified')}</option>
                    <option value="CANCELLED">{t('improvementActions.statusCancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.resolutionLabel')}</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.resolution || ''}
                    onChange={(e) => setForm(f => ({ ...f, resolution: e.target.value }))}
                    placeholder={t('improvementActions.resolutionPlaceholder')}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{t('improvementActions.notesLabel')}</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]"
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder={t('improvementActions.notesPlaceholder')}
              />
            </div>

            {/* AI suggestion (show if present) */}
            {(form.ai_generated || editingAction?.ai_suggestion) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-1">{t('improvementActions.aiSuggestion')}</p>
                <p className="text-xs text-blue-700">{form.ai_suggestion || editingAction?.ai_suggestion || t('improvementActions.noSuggestion')}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingAction ? t('improvementActions.saveChanges') : t('improvementActions.createAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('improvementActions.deleteAction')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {t('improvementActions.deleteConfirm')} <strong>{deleteTarget?.title}</strong>? {t('improvementActions.deleteCannotUndo')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      )}
    </div>
  );
}
