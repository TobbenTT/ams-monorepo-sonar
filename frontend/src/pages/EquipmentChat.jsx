import { useState, useRef } from 'react';
import { LoadingSpinner } from '../components/Shared';

export default function EquipmentChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfName, setPdfName] = useState(null);
    const fileRef = useRef(null);
    const chatEndRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
        if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
            setPdfName(file.name);
            setMessages(prev => [...prev, {
                role: 'system', content: `Manual loaded: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`
            }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Simulated RAG response — will connect to real API when manual_loader engine is wired
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: pdfName
                    ? `Based on the manual "${pdfName}", here's what I found regarding your query:\n\n` +
                      `This feature requires the ANTHROPIC_API_KEY to be configured on the server. ` +
                      `Once configured, I can search through equipment manuals using Claude's native RAG capabilities ` +
                      `to provide specific answers from your uploaded documentation.`
                    : 'Please upload an equipment manual (PDF) first by dragging it into the upload zone above, ' +
                      'then ask your question about the equipment.'
            }]);
            setLoading(false);
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">Equipment Chat — RAG Manual Query</h1>

            {/* PDF Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
            >
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleDrop} />
                {pdfName ? (
                    <div className="text-sm">
                        <span className="text-green-700 font-medium">Loaded:</span> {pdfName}
                        <div className="text-xs text-muted-foreground mt-1">Click or drag to replace</div>
                    </div>
                ) : (
                    <div>
                        <div className="text-3xl mb-2">📄</div>
                        <div className="text-sm font-medium">Drop equipment manual (PDF) here</div>
                        <div className="text-xs text-muted-foreground mt-1">or click to browse</div>
                    </div>
                )}
            </div>

            {/* Chat area */}
            <div className="bg-card rounded-xl border flex flex-col" style={{ height: '500px' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-10">
                            Upload a PDF manual and ask questions about your equipment
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                msg.role === 'user' ? 'bg-primary text-white' :
                                msg.role === 'system' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                                'bg-muted/50'
                            }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground">Thinking...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-3 flex gap-2">
                    <input
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Ask about equipment maintenance, procedures, specs..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        disabled={loading}
                    />
                    <button onClick={handleSend} disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
