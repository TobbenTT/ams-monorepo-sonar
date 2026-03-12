import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-purple-100 text-purple-800',
};

export default function ExecutionChecklists() {
    const { plant } = useOutletContext();
    const [checklists, setChecklists] = useState([]);
    const [activeChecklist, setActiveChecklist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [createForm, setCreateForm] = useState({ work_package_id: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.listChecklists({ plant_id: plant });
            setChecklists(Array.isArray(result) ? result : result.checklists || []);
        } catch { setChecklists([]); }
        setLoading(false);
    }, [plant]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!createForm.work_package_id) return;
        try {
            const cl = await api.createChecklist(createForm);
            setActiveChecklist(cl);
            await load();
        } catch { /* ignore */ }
    };

    const handleView = async (id) => {
        try {
            const cl = await api.getChecklist(id);
            setActiveChecklist(cl);
        } catch { /* ignore */ }
    };

    const handleStepComplete = async (stepIndex, completed) => {
        if (!activeChecklist) return;
        try {
            const updated = await api.completeChecklistStep(activeChecklist.checklist_id, { step_index: stepIndex, completed });
            setActiveChecklist(updated);
        } catch { /* ignore */ }
    };

    if (loading) return <LoadingSpinner message="Cargando checklists..." />;

    const steps = activeChecklist?.steps || [];
    const completedSteps = steps.filter(s => s.completed).length;
    const progress = steps.length > 0 ? (completedSteps / steps.length * 100) : 0;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">Execution Checklists</h1>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard label="Total Checklists" value={checklists.length} />
                <KPICard label="In Progress" value={checklists.filter(c => c.status === 'IN_PROGRESS').length} variant="info" />
                <KPICard label="Completed" value={checklists.filter(c => c.status === 'COMPLETED').length} variant="success" />
                <KPICard label="Draft" value={checklists.filter(c => c.status === 'DRAFT').length} />
            </div>

            <div className="grid md:grid-cols-3 gap-5">
                {/* Left panel: list + create */}
                <div className="space-y-4">
                    <div className="bg-card rounded-xl border p-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Generate Checklist</div>
                        <div className="space-y-2">
                            <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Work Package ID"
                                value={createForm.work_package_id} onChange={e => setCreateForm({ ...createForm, work_package_id: e.target.value })} />
                            <button onClick={handleCreate} disabled={!createForm.work_package_id}
                                className="w-full px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50">
                                Generate
                            </button>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">All Checklists</div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {checklists.map(cl => (
                                <button key={cl.checklist_id} onClick={() => handleView(cl.checklist_id)}
                                    className={`w-full text-left p-2 rounded border text-sm hover:bg-muted/50 ${activeChecklist?.checklist_id === cl.checklist_id ? 'border-primary bg-primary/5' : ''}`}>
                                    <div className="font-medium truncate">{cl.work_package_name || cl.work_package_id}</div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[cl.status] || 'bg-gray-100'}`}>{cl.status}</span>
                                        <span className="text-[10px] text-muted-foreground">{cl.equipment_tag}</span>
                                    </div>
                                </button>
                            ))}
                            {checklists.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No checklists yet</div>}
                        </div>
                    </div>
                </div>

                {/* Right panel: checklist detail */}
                <div className="md:col-span-2">
                    {activeChecklist ? (
                        <div className="bg-card rounded-xl border p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold">{activeChecklist.work_package_name || activeChecklist.work_package_id}</h2>
                                    <div className="text-xs text-muted-foreground">{activeChecklist.equipment_tag} — {activeChecklist.equipment_name}</div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[activeChecklist.status] || 'bg-gray-100'}`}>
                                    {activeChecklist.status}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{completedSteps} / {steps.length} steps</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            {/* Safety section */}
                            {activeChecklist.safety_section?.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="text-xs font-bold uppercase text-red-800 mb-2">Safety Requirements</div>
                                    <ul className="text-xs space-y-1">
                                        {activeChecklist.safety_section.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-red-600 mt-0.5">⚠</span>
                                                <span>{typeof item === 'string' ? item : item.description || item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Steps */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase text-muted-foreground">Execution Steps</div>
                                {steps.map((step, i) => (
                                    <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${step.completed ? 'bg-green-50 border-green-200' : 'hover:bg-muted/30'}`}>
                                        <input type="checkbox" checked={!!step.completed}
                                            onChange={e => handleStepComplete(i, e.target.checked)}
                                            className="mt-0.5 w-4 h-4 accent-green-600" />
                                        <div className="flex-1">
                                            <div className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {typeof step === 'string' ? step : step.description || step.text || `Step ${i + 1}`}
                                            </div>
                                            {step.notes && <div className="text-xs text-muted-foreground mt-1">{step.notes}</div>}
                                        </div>
                                        <span className="text-xs text-muted-foreground">#{i + 1}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Pre/Post notes */}
                            {activeChecklist.pre_task_notes && (
                                <div className="text-xs"><span className="font-bold">Pre-task:</span> {activeChecklist.pre_task_notes}</div>
                            )}
                            {activeChecklist.post_task_notes && (
                                <div className="text-xs"><span className="font-bold">Post-task:</span> {activeChecklist.post_task_notes}</div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                            Select or generate a checklist to view execution steps
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
