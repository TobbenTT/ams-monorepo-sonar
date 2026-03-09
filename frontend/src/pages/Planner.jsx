import { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Bot, User, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

function getAIResponse(text, t) {
  const lower = text.toLowerCase();
  if (lower.includes('molienda') || lower.includes('grinding') || lower.includes('agrupar') || lower.includes('group') || lower.includes('طحن'))
    return t('planner.responses.grinding');
  if (lower.includes('sag') || lower.includes('tendencia') || lower.includes('trend') || lower.includes('falla') || lower.includes('failure') || lower.includes('عطل'))
    return t('planner.responses.sag');
  if (lower.includes('resumen') || lower.includes('summary') || lower.includes('ejecutivo') || lower.includes('executive') || lower.includes('ملخص'))
    return t('planner.responses.summary');
  return t('planner.responses.default');
}

function formatText(text) {
  const parts = text.split('\n');
  return parts.map((line, i) => {
    // Safe rendering: split on **bold** markers and render with React elements
    const segments = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={i}>
        {segments.map((seg, j) =>
          j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg
        )}
        {i < parts.length - 1 && <br />}
      </span>
    );
  });
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Planner() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('planner.welcomeMessage'),
      time: timeNow(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const [pendingValidation, setPendingValidation] = useState(0);
  const [criticalP1, setCriticalP1] = useState(0);
  const [backlogCount, setBacklogCount] = useState(0);

  useEffect(() => {
    api.listWorkRequests().then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setPendingValidation(arr.filter((r) => r.status === 'PENDING_VALIDATION').length);
      setCriticalP1(arr.filter((r) => (r.ai_classification?.priority_suggested || '') === '1_CRITICAL').length);
    }).catch(() => {});
    api.listBacklog().then((data) => {
      setBacklogCount(Array.isArray(data) ? data.length : 0);
    }).catch(() => {});
  }, []);
  const suggestions = t('planner.suggestions');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    const userText = (text ?? input).trim();
    if (!userText) return;

    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userText, time: timeNow() },
    ]);
    setLoading(true);

    const response = getAIResponse(userText, t);
    setLoading(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: response, time: timeNow() },
    ]);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <BrainCircuit size={22} className="text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('planner.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('planner.subtitle')}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t('planner.aiActive')}
        </div>
      </div>

      {/* Context Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{backlogCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('planner.backlogItems')}</p>
        </div>
        <div className="bg-card rounded-xl border border-amber-200 dark:border-amber-700 p-4 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle size={14} className="text-amber-500" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingValidation}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t('planner.pendingValidation')}</p>
        </div>
        <div className="bg-card rounded-xl border border-red-200 dark:border-red-700 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{criticalP1}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('planner.criticalP1')}</p>
        </div>
      </div>

      {/* Chat + Suggestions */}
      <div className="flex flex-col flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '420px' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot size={16} className="text-green-700" />
                </div>
              )}
              <div className={`max-w-xl rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-muted text-foreground border border-border rounded-bl-none'
              }`}>
                <div>{formatText(msg.content)}</div>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Bot size={16} className="text-green-700" />
              </div>
              <div className="bg-muted border border-border rounded-xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size={14} className="animate-spin text-[#1B5E20]" />
                <span>{t('planner.analyzing')}</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="border-t border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
          {Array.isArray(suggestions) && suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              disabled={loading}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={t('planner.inputPlaceholder')}
            className="flex-1 text-sm px-4 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/40 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted border border-border rounded-lg px-4 py-2">
        <AlertCircle size={13} className="text-amber-400 flex-shrink-0" />
        <span>{t('planner.disclaimer')}</span>
      </div>
    </div>
  );
}
