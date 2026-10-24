import React, { useState } from 'react';
import { X, Copy, CheckCheck, Share2 } from 'lucide-react';
import type { Post } from '../types';

export function ShareModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/#post_${post.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl p-5 w-full max-w-md mx-auto shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Share Post</h3>
          <button onClick={onClose}><X size={18} className="text-neutral-400" /></button>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">{post.content}</p>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:border-sky-500 transition"
        >
          <div className="flex items-center gap-2">
            {copied ? <CheckCheck size={16} className="text-green-500" /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </div>
          <span className="text-[10px] text-neutral-400 truncate max-w-[150px]">{shareUrl}</span>
        </button>
      </div>
    </div>
  );
}
