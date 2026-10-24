import React from 'react';
import { Bot, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export const TopHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
      <Link to="/" className="text-2xl font-black tracking-tighter text-black dark:text-white">
        Z<span className="text-brand-500">.</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/ai"
          className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-500 hover:bg-brand-500/20"
        >
          <Bot size={16} />
          <span>Ask Z</span>
        </Link>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};