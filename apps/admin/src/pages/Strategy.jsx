import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, Clock, Users, TrendingUp, Filter, Settings, ArrowRight } from 'lucide-react';
import { criticalityColor, statusColor } from '../data/mockData';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const TASK_TYPE_COLOR = {
  CBM: 'bg-blue-100 text-blue-800 border border-blue-300',
  TBM: 'bg-purple-100 text-purple-800 border border-purple-300',
  RTF: 'bg-gray-100 text-gray-700 border border-gray-300',
  FTM: 'bg-amber-100 text-amber-800 border border-amber-300',
};

const TASK_TYPE_DOT = {
  CBM: 'bg-blue-500',
  TBM: 'bg-purple-500',
  RTF: 'bg-gray-400',
  FTM: 'bg-amber-500',
};

const STRATEGY_SHORT = {
  CONDITION_BASED: 'CBM',
  FIXED_TIME: 'TBM',
  RUN_TO_FAILURE: 'RTF',
  FAULT_FINDING: 'FTM',
  REDESIGN: 'RDS',
};

export default function Strategy() {
  const { t } = useLanguage();
  const { plant } = useOutletContext();
  const [filterType, setFilterType] = useState('');
  const [filterEq, setFilterEq] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    api.listTasks({ plant_id: plant })
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data.map(tk => ({
            ...tk,
            type: STRATEGY_SHORT[tk.task_type] || tk.task_type,
          })));
        }
      })
      .catch(() => {});
    api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' })
      .then(data => { if (Array.isArray(data)) setEquipment(data); })
      .catch(() => {});
  }, [plant]);

  const RCM_PHASES = [
    { num: '01', label: t('strategy.phase1'), icon: Settings },
    { num: '02', label: t('strategy.phase2'), icon: Filter },
    { num: '03', label: t('strategy.phase3'), icon: TrendingUp },
    { num: '04', label: t('strategy.phase4'), icon: CheckCircle },
    { num: '05', label: t('strategy.phase5'), icon: Users },
  ];

  const DECISION_NODES = [
    {
      id: 1,
      question: t('strategy.decision1Q'),
      yes: t('strategy.decision1Yes'),
      no: t('strategy.decision1No'),
      yesColor: 'text-green-700',
      noColor: 'text-amber-700',
    },
    {
      id: 2,
      question: t('strategy.decision2Q'),
      yes: t('strategy.decision2Yes'),
      no: t('strategy.decision2No'),
      yesColor: 'text-red-700',
      noColor: 'text-blue-700',
    },
    {
      id: 3,
      question: t('strategy.decision3Q'),
      yes: t('strategy.decision3Yes'),
      no: t('strategy.decision3No'),
      yesColor: 'text-purple-700',
      noColor: 'text-gray-600',
    },
    {
      id: 4,
      question: t('strategy.decision4Q'),
      yes: t('strategy.decision4Yes'),
      no: t('strategy.decision4No'),
      yesColor: 'text-blue-700',
      noColor: 'text-purple-700',
    },
  ];

  const LEGEND = [
    { type: 'CBM', descKey: 'strategy.cbmLabel', detailKey: 'strategy.cbmDetail' },
    { type: 'TBM', descKey: 'strategy.tbmLabel', detailKey: 'strategy.tbmDetail' },
    { type: 'RTF', descKey: 'strategy.rtfLabel', detailKey: 'strategy.rtfDetail' },
    { type: 'FTM', descKey: 'strategy.ftmLabel', detailKey: 'strategy.ftmDetail' },
  ];

  const eqTags = [...new Set(tasks.map((s) => s.equipment_tag).filter(Boolean))];

  const filtered = tasks.filter((s) => {
    if (filterType && s.type !== filterType) return false;
    if (filterEq && s.equipment_tag !== filterEq) return false;
    return true;
  });

  const cbmCount = tasks.filter((s) => s.type === 'CBM').length;
  const tbmCount = tasks.filter((s) => s.type === 'TBM').length;
  const totalHours = tasks.reduce((acc, s) => acc + (s.duration_h || 0), 0);

  const getEqCriticality = (tag) => {
    const eq = equipment.find((e) => (e.code || e.tag) === tag);
    return eq?.criticality || 'B';
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('strategy.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('strategy.subtitle')}</p>
      </div>

      {/* RCM 5-phase process */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 mb-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t('strategy.rcmProcess')}
        </h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {RCM_PHASES.map((phase, idx) => (
            <div key={phase.num} className="flex items-center">
              <div className={`flex flex-col items-center min-w-[130px] px-4 py-4 rounded-xl border-2 transition-all ${
                idx === 4
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-md'
                  : idx === 3
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 shadow-md'
                  : 'border-border bg-muted/30 hover:bg-muted/60'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  idx === 4 ? 'bg-green-600 text-white' : idx === 3 ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="text-sm font-black">{phase.num}</span>
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {phase.label}
                </span>
              </div>
              {idx < RCM_PHASES.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[
          { key: 'tasks', label: t('strategy.maintenanceTasks') },
          { key: 'decision', label: t('strategy.decisionTree') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#1B5E20] text-white shadow-sm'
                : 'bg-card text-foreground border border-border hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm p-4 flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('strategy.cbmTasks')}</p>
                <p className="text-2xl font-bold text-foreground">{cbmCount}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-purple-200 dark:border-purple-700 shadow-sm p-4 flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('strategy.tbmTasks')}</p>
                <p className="text-2xl font-bold text-foreground">{tbmCount}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-green-200 dark:border-green-700 shadow-sm p-4 flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('strategy.totalHours')}</p>
                <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)} h</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('strategy.type')}:</span>
              {['', 'CBM', 'TBM', 'RTF', 'FTM'].map((tp) => (
                <button
                  key={tp || 'all'}
                  onClick={() => setFilterType(tp)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    filterType === tp
                      ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {tp || t('strategy.all')}
                </button>
              ))}
              <span className="text-sm font-medium text-muted-foreground ml-4">{t('strategy.equipment')}:</span>
              <select
                value={filterEq}
                onChange={(e) => setFilterEq(e.target.value)}
                className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
              >
                <option value="">{t('strategy.allEquipment')}</option>
                {eqTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    {[t('strategy.taskId'), t('strategy.equipment'), t('strategy.crit'), t('strategy.description'), t('strategy.type'), t('strategy.frequency'), t('strategy.duration'), t('strategy.resource'), t('strategy.status')].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((task) => (
                    <tr key={task.task_id}
                      onClick={() => setSelectedTask(selectedTask?.task_id === task.task_id ? null : task)}
                      className={`border-b border-border cursor-pointer transition-colors ${selectedTask?.task_id === task.task_id ? 'bg-[#1B5E20]/10 dark:bg-green-900/20' : 'hover:bg-muted/50'}`}>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{task.task_id}</td>
                      <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{task.equipment_tag}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${criticalityColor(getEqCriticality(task.equipment_tag))}`}>
                          {getEqCriticality(task.equipment_tag)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground max-w-xs">{task.task_description}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TASK_TYPE_COLOR[task.type] || 'bg-gray-100 text-gray-600'}`}>
                          {task.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{task.frequency}</td>
                      <td className="px-3 py-2 text-center font-medium text-foreground">{task.duration_h} h</td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{task.resource}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                        {t('strategy.noTasks')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t('strategy.showing')} {filtered.length} / {tasks.length}
            </p>
          </div>

          {/* Task Detail Panel */}
          {selectedTask && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider">
                  {t('strategy.taskDetails') || 'Task Details'}
                </h3>
                <button onClick={() => setSelectedTask(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground text-xs">✕</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">Task ID</span>
                  <span className="text-sm font-mono text-foreground">{selectedTask.task_id}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.equipment')}</span>
                  <span className="text-sm font-medium text-foreground">{selectedTask.equipment_tag}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.type')}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TASK_TYPE_COLOR[selectedTask.type] || ''}`}>{selectedTask.type}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.status')}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(selectedTask.status)}`}>{selectedTask.status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.description')}</span>
                  <span className="text-sm text-foreground">{selectedTask.name || selectedTask.task_description}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.frequency')}</span>
                  <span className="text-sm text-foreground">{selectedTask.frequency || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.duration')}</span>
                  <span className="text-sm text-foreground">{selectedTask.duration_h} h</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">Constraint</span>
                  <span className="text-sm text-foreground">{selectedTask.constraint || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">{t('strategy.resource')}</span>
                  <span className="text-sm text-foreground">{selectedTask.resource || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Decision Tree */}
      {activeTab === 'decision' && (
        <div className="space-y-5">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-foreground mb-6">
              {t('strategy.decisionTreeSteps')}
            </h2>
            <div className="space-y-4">
              {DECISION_NODES.map((node, idx) => (
                <div key={node.id} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                      {node.id}
                    </div>
                    <div className="flex-1 bg-muted rounded-xl border border-border p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">{node.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 p-3">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-green-700 dark:text-green-400">{t('common.yes').toUpperCase()}</span>
                            <p className={`text-xs mt-0.5 ${node.yesColor}`}>{node.yes}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 p-3">
                          <div className="w-4 h-4 rounded-full border-2 border-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-red-700 dark:text-red-400">{t('common.no').toUpperCase()}</span>
                            <p className={`text-xs mt-0.5 ${node.noColor}`}>{node.no}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {idx < DECISION_NODES.length - 1 && (
                    <div className="ml-5 w-0.5 h-4 bg-[#1B5E20]/30 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {LEGEND.map(({ type, descKey, detailKey }) => (
              <div key={type} className="bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${TASK_TYPE_DOT[type]}`} />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TASK_TYPE_COLOR[type]}`}>
                    {type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{t(descKey)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(detailKey)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
