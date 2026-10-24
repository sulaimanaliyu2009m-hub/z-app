import React from 'react';
import { Bot, Send } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-140px)] flex-col justify-between p-4">
      <div className="flex flex-col items-center justify-center flex-1 text-center text-neutral-500">
        <Bot size={48} className="text-brand-500 mb-2 animate-bounce" />
        <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Z Intelligent Core</h3>
        <p className="text-xs max-w-xs mt-1">Ask anything, summarize trends, generate post ideas, or draft replies.</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Ask Z AI anything..."
          className="w-full rounded-full bg-neutral-100 py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-900"
        />
        <button className="absolute right-2 top-2 rounded-full bg-brand-500 p-1.5 text-white">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};