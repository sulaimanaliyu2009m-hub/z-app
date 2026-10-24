import React from 'react';
import { Search, TrendingUp, Users } from 'lucide-react';

export const Discover: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
        <input
          type="text"
          placeholder="Search trends, groups, tags..."
          className="w-full rounded-full bg-neutral-100 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-900"
        />
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-neutral-600 dark:text-neutral-400">
          <TrendingUp size={16} /> <span>Trending on Z</span>
        </div>
        <div className="space-y-2">
          {['#TechRevolution', '#NextGenAI', '#CyberSecurity', '#Web3Design'].map((tag) => (
            <div key={tag} className="flex justify-between border-b border-neutral-100 py-2 text-sm dark:border-neutral-900">
              <span className="font-semibold">{tag}</span>
              <span className="text-xs text-neutral-500">24.5k posts</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-neutral-600 dark:text-neutral-400">
          <Users size={16} /> <span>Suggested Groups</span>
        </div>
        <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
          <h4 className="font-bold text-sm">Fullstack Creators</h4>
          <p className="text-xs text-neutral-500">12k members · 80 posts/day</p>
        </div>
      </section>
    </div>
  );
};