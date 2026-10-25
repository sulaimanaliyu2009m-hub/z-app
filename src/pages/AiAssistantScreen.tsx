import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { api } from '../services/api';

export function AiAssistantScreen() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello! I am Z Brain powered by Gemini Flash. Ask me for viral content ideas, script drafting, code review, or trend analysis.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const updatedChat = [...chat, { sender: 'user' as const, text: textToSend.trim() }];
    setChat(updatedChat);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chatWithAi(updatedChat);
      setChat(prev => [...prev, { sender: 'ai' as const, text: response.reply }]);
    } catch (err: any) {
      setChat(prev => [...prev, { sender: 'ai' as const, text: `⚠️ Error: ${err.message || 'Gemini request failed'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const prompts = [
    '💡 5 viral post ideas for Kali Linux devs',
    '🎬 30s TikTok reel script for AI tools',
    '✍️ Write a professional bio for my profile'
  ];

  return (
    <div className="p-4 h-[calc(100vh-140px)] flex flex-col justify-between max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-sky-500 text-white rounded-br-none' 
                : 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-bl-none text-neutral-900 dark:text-neutral-100'
            }`}>
              {m.sender === 'ai' && (
                <div className="flex items-center gap-1 text-[10px] text-sky-400 font-bold mb-1">
                  <Sparkles size={11} /> Gemini Flash
                </div>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-sky-400" />
              <span>Z Brain is thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.slice(2))}
            disabled={isLoading}
            className="text-[10px] whitespace-nowrap px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-sky-500 rounded-full text-neutral-400 hover:text-sky-400 transition"
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative mt-1">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Z AI anything..." 
          disabled={isLoading}
          className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 pr-12 rounded-full text-xs outline-none focus:border-sky-500" 
        />
        <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-2 bg-sky-500 disabled:opacity-40 p-2 rounded-full text-white">
          <Send size={13}/>
        </button>
      </form>
    </div>
  );
}
