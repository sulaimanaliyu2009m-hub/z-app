import React, { useState } from 'react';
import { mockPosts } from '../services/mockData';

export const Home: React.FC = () => {
  const [feedType, setFeedType] = useState<'flow' | 'reels'>('flow');

  return (
    <div className="flex flex-col">
      {/* Switcher: X-style Flow vs TikTok-style Reels */}
      <div className="sticky top-[57px] z-30 flex border-b border-neutral-200 bg-white/95 dark:border-neutral-800 dark:bg-neutral-950/95">
        <button
          onClick={() => setFeedType('flow')}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-all ${
            feedType === 'flow'
              ? 'border-b-2 border-brand-500 text-neutral-900 dark:text-white'
              : 'text-neutral-500'
          }`}
        >
          Flow (Live)
        </button>
        <button
          onClick={() => setFeedType('reels')}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-all ${
            feedType === 'reels'
              ? 'border-b-2 border-brand-500 text-neutral-900 dark:text-white'
              : 'text-neutral-500'
          }`}
        >
          Reels (Video)
        </button>
      </div>

      <div className="p-4">
        {feedType === 'flow' ? (
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <div key={post.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <img src={post.author.avatar} alt="avatar" className="h-10 w-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold">{post.author.displayName}</h4>
                    <p className="text-xs text-neutral-500">@{post.author.username} · {post.createdAt}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center rounded-xl bg-neutral-900 text-neutral-400">
            TikTok-style Fullscreen Video Player Placeholder
          </div>
        )}
      </div>
    </div>
  );
};