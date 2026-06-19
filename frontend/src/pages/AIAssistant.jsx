import React, { useState } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import api from '../services/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Verdora Farms, your AI Farm Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/assistant', { prompt: currentInput });
      setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't connect to the AI service. Please make sure the Gemini API key is configured.", isBot: true, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f1712] rounded-3xl shadow-2xl h-[calc(100vh-8rem)] flex flex-col overflow-hidden border border-white/10 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 flex items-center space-x-4 relative z-10">
        <div className="p-3 bg-accent/20 text-accent border border-accent/30 rounded-2xl shadow-[0_0_15px_rgba(212,163,115,0.3)]">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">Verdora Farms Assistant</h2>
          <p className="text-sm text-accent/80 font-bold tracking-widest uppercase mt-1">Powered by Gemini AI</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-3xl p-5 shadow-lg ${msg.isBot ? (msg.isError ? 'bg-red-500/10 border border-red-500/30 text-red-400 rounded-tl-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none') : 'bg-accent/20 border border-accent/30 text-white rounded-tr-none'}`}>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-wide">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-none p-5 flex items-center space-x-3 text-gray-400 shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-sm font-bold tracking-widest uppercase">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 flex items-center gap-4 relative z-10">
        <input 
          type="text" 
          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all"
          placeholder="Ask me anything about your farm..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-accent text-dark p-4 rounded-2xl hover:bg-white disabled:bg-white/10 disabled:text-gray-500 font-black transition-all duration-300 shadow-[0_0_15px_rgba(212,163,115,0.4)]">
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
