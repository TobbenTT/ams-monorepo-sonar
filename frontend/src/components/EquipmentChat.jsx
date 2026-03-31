import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User } from 'lucide-react';
import * as api from '../api';

function simpleMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<div class="font-bold text-xs text-gray-500 mt-2 mb-1 uppercase">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="font-semibold text-sm text-gray-700 mt-2 mb-1">$1</div>')
    .replace(/^# (.+)$/gm, '<div class="font-bold text-sm text-gray-900 mt-2 mb-1">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-1 ml-1"><span class="text-gray-400">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="ml-1">$&</div>')
    .replace(/^---$/gm, '<hr class="my-2 border-gray-200"/>')
    .replace(/\n{2,}/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');
}

const QUICK_ASKS = [
  'History de fallas',
  'Materiales frecuentes',
  'Ultima intervención',
];

export default function EquipmentChat({ equipmentTag, equipmentName, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setInput('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, equipmentTag]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const conversationHistory = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  async function sendMessage(question) {
    const text = question ?? input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.equipmentChat({
        equipment_tag: equipmentTag,
        question: text,
        conversation_history: conversationHistory,
      });
      const answer = res?.answer ?? res?.response ?? res?.content ?? JSON.stringify(res);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer, id: Date.now() + 1 },
      ]);
    } catch (err) {
      setError(err.message || 'Error al contactar el asistente');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
      style={{ width: 380, maxHeight: 500 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={18} className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">
              {equipmentTag}
            </p>
            {equipmentName && (
              <p className="text-xs text-green-100 truncate leading-tight">
                {equipmentName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-green-700 transition-colors"
          aria-label="Cerrar chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-xs text-gray-400 text-center">
              Pregunta sobre este equipo
            </p>
            <div className="flex flex-col gap-2 w-full">
              {QUICK_ASKS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-white hover:bg-green-50 hover:border-green-400 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              {msg.role === 'user' ? (
                <User size={12} className="text-white" />
              ) : (
                <Bot size={12} className="text-gray-600" />
              )}
            </div>
            <div
              className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-tr-sm whitespace-pre-wrap'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm chat-ai-msg'
              }`}
              {...(msg.role === 'assistant' ? { dangerouslySetInnerHTML: { __html: simpleMarkdown(msg.content) } } : {})}
            >
              {msg.role === 'user' ? msg.content : null}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <Bot size={12} className="text-gray-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
              <Loader2 size={16} className="text-green-600 animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
          className="flex-1 text-sm rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 disabled:opacity-50 bg-gray-50 transition-colors"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          aria-label="Enviar"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Floating trigger button — render this when no equipment is selected or as the
 * always-visible launcher. Pass onClick to open the chat panel.
 */
export function EquipmentChatFAB({ onClick, hasEquipment }) {
  return (
    <button
      onClick={onClick}
      disabled={!hasEquipment}
      title={hasEquipment ? 'Chat con asistente IA' : 'Selecciona un equipo'}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
    >
      <MessageCircle size={24} />
    </button>
  );
}
