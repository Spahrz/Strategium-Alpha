import React, { useState, useRef, useEffect } from 'react';
import { chatWithTactician } from '../services/geminiService';
import { ChatMessage } from '../types';

const TacticalCogitator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Greetings, Commander. I am the Logis Strategos. How may I assist you with the Tactica Imperialis today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    try {
        const responseText = await chatWithTactician(userMsg.text, history);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-black/40 rounded-lg border border-auspex-border overflow-hidden">
      {/* Header */}
      <div className="bg-auspex-panel p-4 border-b border-auspex-border flex justify-between items-center">
        <h3 className="text-imperial-gold font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="animate-pulse text-green-500">●</span> Tactical Cogitator Link
        </h3>
        <span className="text-xs text-text-secondary font-mono">STATUS: ACTIVE</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-900/50 text-white border border-blue-700'
                  : 'bg-auspex-panel text-text-secondary border border-auspex-border'
              }`}
            >
              {msg.role === 'model' && <div className="text-xs text-imperial-gold mb-1 font-bold uppercase">Logis Strategos</div>}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-auspex-panel border border-auspex-border px-4 py-3 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-imperial-gold rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-imperial-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-imperial-gold rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-auspex-panel border-t border-auspex-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for rules clarification or tactical advice..."
            className="flex-1 bg-black/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-imperial-gold font-mono"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-imperial-gold text-black font-bold uppercase px-6 py-2 rounded hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Transmit
          </button>
        </form>
      </div>
    </div>
  );
};

export default TacticalCogitator;