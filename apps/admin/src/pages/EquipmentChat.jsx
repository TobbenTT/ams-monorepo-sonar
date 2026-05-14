import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const BOT_AVATAR = (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
        AI
    </div>
);
const USER_AVATAR = (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        U
    </div>
);

export default function EquipmentChat() {
    const { plant } = useOutletContext();
    const { t } = useLanguage();
    const [equipment, setEquipment] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextSummary, setContextSummary] = useState(null);
    const chatEndRef = useRef(null);
    const dropdownRef = useRef(null);

    // Load equipment list
    useEffect(() => {
        api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' })
            .then(r => setEquipment(r.data || r || []))
            .catch(() => {});
    }, [plant]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const filteredEquipment = equipment.filter(e => {
        const q = search.toLowerCase();
        return !q ||
            (e.tag || '').toLowerCase().includes(q) ||
            (e.code || '').toLowerCase().includes(q) ||
            (e.name || '').toLowerCase().includes(q);
    });

    const selectEquipment = useCallback((eq) => {
        const tag = eq.tag || eq.code;
        setSelectedTag(tag);
        setSelectedName(eq.name || tag);
        setSearch('');
        setShowDropdown(false);
        setMessages([]);
        setContextSummary(null);
    }, []);

    const handleSend = async (text) => {
        const question = text || input.trim();
        if (!question || !selectedTag || loading) return;

        const userMsg = { role: 'user', content: question };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Build conversation history (previous messages, not including current)
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await api.equipmentChat({
                equipment_tag: selectedTag,
                question,
                conversation_history: history,
            });

            const data = res.data || res;
            if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                if (data.context_summary) setContextSummary(data.context_summary);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.error || t('equipmentChat.errorApi'),
                }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `${t('equipmentChat.errorApi')}: ${err.response?.data?.detail || err.message}`,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setContextSummary(null);
    };

    // SF-345 EquipmentDoctor — structured diagnosis with confidence + WR suggestion.
    const handleDiagnose = async () => {
        const symptoms = input.trim();
        if (!symptoms || !selectedTag || loading) return;
        setMessages(prev => [...prev, { role: 'user', content: `🩺 Diagnóstico: ${symptoms}` }]);
        setInput('');
        setLoading(true);
        try {
            const res = await api.equipmentDoctor({
                equipment_tag: selectedTag,
                symptom_description: symptoms,
                include_wr_suggestion: true,
            });
            const data = res?.result || res;
            const diag = data?.diagnosis || {};
            const confidence = typeof diag.confidence === 'number'
                ? Math.round(diag.confidence * 100)
                : null;
            const steps = Array.isArray(diag.verification_steps) ? diag.verification_steps : [];
            const wrSug = data?.wr_suggestion;

            const lines = [];
            lines.push(`**Diagnóstico:** ${diag.diagnosis || '—'}`);
            if (confidence != null) lines.push(`**Confianza:** ${confidence}%${confidence >= 85 ? ' ✅' : ' ⚠️ refiná síntomas'}`);
            if (diag.failure_mode) lines.push(`**Modo de falla:** ${diag.failure_mode}`);
            if (diag.failure_category) lines.push(`**Categoría:** ${diag.failure_category}`);
            if (diag.priority) lines.push(`**Prioridad sugerida:** ${diag.priority}`);
            if (steps.length) {
                lines.push('**Pasos de verificación:**');
                steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
            }
            if (diag.corrective_action) lines.push(`**Acción correctiva:** ${diag.corrective_action}`);
            if (wrSug) {
                lines.push('\n**WR sugerida:**');
                if (wrSug.priority_code) lines.push(`  Prioridad: ${wrSug.priority_code}`);
                if (wrSug.estimated_duration_hours) lines.push(`  Duración: ${wrSug.estimated_duration_hours}h`);
                if (Array.isArray(wrSug.suggested_materials) && wrSug.suggested_materials.length) {
                    lines.push(`  Materiales: ${wrSug.suggested_materials.map(m => m.description || m.sap_id || m).join(', ')}`);
                }
            }
            setMessages(prev => [...prev, { role: 'assistant', content: lines.join('\n') }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error en diagnóstico: ${err.response?.data?.detail || err.message}`,
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('equipmentChat.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('equipmentChat.subtitle')}</p>
                </div>
                {messages.length > 0 && (
                    <button onClick={clearChat}
                        className="text-xs px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground">
                        {t('equipmentChat.clearChat')}
                    </button>
                )}
            </div>

            {/* Equipment Selector */}
            <div className="relative" ref={dropdownRef}>
                <div
                    className="flex items-center gap-2 bg-card border rounded-xl px-4 py-3 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedTag ? (
                        <div className="flex-1">
                            <span className="font-mono font-bold text-primary">{selectedTag}</span>
                            <span className="text-muted-foreground ml-2 text-sm">{selectedName}</span>
                        </div>
                    ) : (
                        <span className="flex-1 text-muted-foreground">{t('equipmentChat.selectEquipment')}</span>
                    )}
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {showDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-card border rounded-xl shadow-lg max-h-[300px] overflow-hidden">
                        <div className="p-2 border-b">
                            <input
                                autoFocus
                                className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                                placeholder={t('equipmentChat.searchEquipment')}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[240px]">
                            {filteredEquipment.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground text-center">{t('common.noResults', { query: search })}</div>
                            ) : filteredEquipment.slice(0, 50).map(eq => (
                                <div
                                    key={eq.node_id || eq.tag || eq.code}
                                    className="px-4 py-2.5 hover:bg-muted/50 cursor-pointer flex items-center gap-3 border-b border-border/50 last:border-0"
                                    onClick={() => selectEquipment(eq)}
                                >
                                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                        {eq.tag || eq.code}
                                    </span>
                                    <span className="text-sm truncate">{eq.name}</span>
                                    {eq.criticality && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-auto ${
                                            eq.criticality === 'AA' ? 'bg-red-100 text-red-700' :
                                            eq.criticality === 'A' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{eq.criticality}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Context summary badges */}
            {contextSummary && selectedTag && (
                <div className="flex flex-wrap gap-2">
                    {contextSummary.has_criticality && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                            {t('equipmentChat.criticality')}
                        </span>
                    )}
                    {contextSummary.has_fmea && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                            {t('equipmentChat.fmea')}
                        </span>
                    )}
                    {contextSummary.work_requests_count > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {contextSummary.work_requests_count} {t('equipmentChat.workRequests')}
                        </span>
                    )}
                    {contextSummary.tasks_count > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                            {contextSummary.tasks_count} {t('equipmentChat.tasks')}
                        </span>
                    )}
                    {contextSummary.diagnostics_count > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                            {contextSummary.diagnostics_count} {t('equipmentChat.diagnostics')}
                        </span>
                    )}
                </div>
            )}

            {/* Chat area */}
            <div className="bg-card rounded-xl border flex flex-col" style={{ height: 'calc(100vh - 310px)', minHeight: '400px' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!selectedTag ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p className="text-sm font-medium">{t('equipmentChat.noEquipment')}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="space-y-4">
                            {/* Welcome message */}
                            <div className="flex gap-3">
                                {BOT_AVATAR}
                                <div className="bg-muted/50 rounded-lg rounded-tl-none px-4 py-3 text-sm max-w-[85%]">
                                    <div className="whitespace-pre-wrap">{t('equipmentChat.welcome')}</div>
                                </div>
                            </div>
                            {/* Suggestion buttons */}
                            <div className="flex flex-wrap gap-2 pl-11">
                                {Object.entries(t('equipmentChat.suggestions') || {}).map(([key, text]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleSend(text)}
                                        className="text-xs px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors text-left"
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.role === 'user' ? USER_AVATAR : BOT_AVATAR}
                                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-muted/50 rounded-tl-none'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex gap-3">
                            {BOT_AVATAR}
                            <div className="bg-muted/50 rounded-lg rounded-tl-none px-4 py-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span>{t('equipmentChat.thinking')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t p-3 flex gap-2">
                    <input
                        className="flex-1 border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder={selectedTag ? t('equipmentChat.placeholder') : t('equipmentChat.noEquipment')}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        disabled={loading || !selectedTag}
                    />
                    <button
                        onClick={handleDiagnose}
                        disabled={loading || !input.trim() || !selectedTag}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        title="Diagnóstico estructurado con IA (SF-345)"
                    >
                        🩺 Diagnosticar
                    </button>
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim() || !selectedTag}
                        className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {t('equipmentChat.send')}
                    </button>
                </div>
            </div>
        </div>
    );
}
