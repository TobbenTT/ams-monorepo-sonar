import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import * as api from '../api';

export default function WorkPackages() {
    const { plant } = useOutletContext();
    const { t } = useLanguage();
    const toast = useToast();
    const confirm = useConfirm();
    const [wps, setWps] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('packages');
    const [sapUploads, setSapUploads] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listWorkPackages({ plant_id: plant }),
            api.listSapUploads({ plant_id: plant }),
        ]).then(([w, s]) => {
            const apiWps = w.status === 'fulfilled' ? (Array.isArray(w.value) ? w.value : w.value?.items || []) : [];
            setWps(apiWps);
            const apiUploads = s.status === 'fulfilled' ? (Array.isArray(s.value) ? s.value : []) : [];
            setSapUploads(apiUploads);
            setLoading(false);
        });
    }, [plant]);

    const handleApprove = async (id) => {
        const ok = await confirm(t('workPackages.approveTitle'), t('workPackages.approveConfirm'));
        if (!ok) return;
        try {
            await api.approveWorkPackage(id);
            const updated = await api.listWorkPackages({ plant_id: plant });
            const apiWps = Array.isArray(updated) ? updated : updated?.items || [];
            setWps(apiWps.length > 0 ? apiWps : wps);
            setSelected(prev => prev ? { ...prev, status: 'APPROVED' } : prev);
            toast.success(t('workPackages.approveSuccess'));
        } catch (e) {
            // Fallback: update locally
            setWps(prev => prev.map(w => w.work_package_id === id ? { ...w, status: 'APPROVED' } : w));
            setSelected(prev => prev ? { ...prev, status: 'APPROVED' } : prev);
            toast.error(t('workPackages.approveError') || 'Error approving — updated locally');
        }
    };

    const handleSendToSap = async () => {
        if (!selected) return;
        const ok = await confirm(t('workPackages.sendToSAP'), t('workPackages.sendConfirm', { name: selected.name || selected.work_package_id?.slice(0, 12) }));
        if (!ok) return;
        try {
            await api.exportData({ format: 'sap', work_package_id: selected.work_package_id, plant_id: plant });
            toast.success(t('workPackages.sentToSAP'));
            const uploads = await api.listSapUploads({ plant_id: plant });
            setSapUploads(Array.isArray(uploads) ? uploads : []);
        } catch (e) {
            toast.error(t('workPackages.sapExportFailed') + ': ' + e.message);
        }
    };

    const stats = { total: wps.length, approved: wps.filter(w => w.status === 'APPROVED').length, review: wps.filter(w => w.status === 'REVIEWED' || w.status === 'PRESENTED').length, draft: wps.filter(w => w.status === 'DRAFT').length };

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-5">{t('workPackages.title')} & SAP Export</h1>

            <div className="flex gap-1 border-b border-border mb-4" role="tablist">
                <button className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'packages' ? 'bg-card border border-border border-b-card text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('packages')} role="tab" aria-selected={tab === 'packages'}>{t('workPackages.title')}</button>
                <button className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'sap' ? 'bg-card border border-border border-b-card text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('sap')} role="tab" aria-selected={tab === 'sap'}>{t('workPackages.sapUploads')}</button>
            </div>

            {tab === 'packages' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm border-l-4 border-l-primary">
                            <div className="text-xs text-muted-foreground font-medium">{t('workPackages.totalWPs')}</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm border-l-4 border-l-green-500">
                            <div className="text-xs text-muted-foreground font-medium">{t('workPackages.approved')}</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{stats.approved}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm border-l-4 border-l-blue-500">
                            <div className="text-xs text-muted-foreground font-medium">{t('workPackages.inReview')}</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{stats.review}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm border-l-4 border-l-amber-500">
                            <div className="text-xs text-muted-foreground font-medium">{t('common.draft')}</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{stats.draft}</div>
                        </div>
                    </div>

                    <div className="flex gap-5 flex-col lg:flex-row">
                        <div className="lg:w-[35%] min-w-0">
                            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('workPackages.title')}</div>
                                {loading ? <LoadingSpinner /> : wps.length === 0 ? <p className="text-muted-foreground">{t('workPackages.noWorkPackages')}</p> : wps.map((wp, i) => (
                                    <div key={i} onClick={() => setSelected(wp)} className={`px-3.5 py-2.5 border-b border-border cursor-pointer border-l-[3px] ${selected?.work_package_id === wp.work_package_id ? 'bg-primary/10 border-l-primary' : 'border-l-transparent'}`}>
                                        <div className="font-semibold text-sm">{wp.name || wp.work_package_id?.slice(0, 12)}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={wp.status} />
                                            <span className="text-xs text-muted-foreground">{wp.task_count || 0} {t('workPackages.tasks')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            {selected ? (
                                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold">{selected.name || t('workPackages.workPackage')}</h2>
                                        <StatusBadge status={selected.status} />
                                    </div>
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">{t('common.plant')}: {selected.plant_id || plant}</span>
                                        <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">{t('workPackages.duration')}: {selected.total_duration_hours || 0}h</span>
                                        <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">{t('workPackages.tasks')}: {selected.task_count || 0}</span>
                                    </div>
                                    {selected.tasks && selected.tasks.length > 0 && (
                                        <div className="mb-4 overflow-x-auto">
                                            <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('workPackages.includedTasks')}</div>
                                            <table className="data-table">
                                                <thead><tr><th>{t('workPackages.task')}</th><th>{t('common.type')}</th><th>{t('workPackages.duration')}</th></tr></thead>
                                                <tbody>
                                                    {selected.tasks.map((tk, i) => (
                                                        <tr key={i}><td>{tk.description || tk.task_id?.slice(0, 8)}</td><td className="font-mono text-xs">{tk.task_type}</td><td>{tk.duration_hours}h</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        {selected.status !== 'APPROVED' && <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={() => handleApprove(selected.work_package_id)}>{t('common.approve')}</button>}
                                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors" onClick={handleSendToSap}>{t('workPackages.sendToSAP')}</button>
                                    </div>
                                </div>
                            ) : <div className="bg-card border border-border rounded-lg p-5 shadow-sm"><div className="text-center py-16 px-5 text-muted-foreground"><h3>{t('workPackages.selectWP')}</h3></div></div>}
                        </div>
                    </div>
                </>
            )}

            {tab === 'sap' && (
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('workPackages.sapUploads')}</div>
                    {sapUploads.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead><tr><th>{t('workPackages.uploadId')}</th><th>{t('workPackages.template')}</th><th>{t('common.status')}</th><th>{t('workPackages.records')}</th></tr></thead>
                                <tbody>
                                    {sapUploads.map((u, i) => (
                                        <tr key={i}><td className="font-mono text-xs">{(u.upload_id || '').slice(0, 8)}</td><td>{u.template_type || '—'}</td><td><StatusBadge status={u.status} /></td><td>{u.record_count || 0}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className="text-center py-16 px-5 text-muted-foreground"><h3>{t('workPackages.noSAPUploads')}</h3><p>{t('workPackages.approveToGenerate')}</p></div>}
                </div>
            )}
        </div>
    );
}
