import React, { useState } from 'react';
import { X, Repeat2 } from 'lucide-react';
import type { Post } from '../types';

export function QuoteModal({
  post,
  onClose,
  onSubmitQuote
}: {
  post: Post;
  onClose: () => void;
  onSubmitQuote: (content: string, quoteOfId: string) => Promise<void>;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remaining = 280 - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || remaining < 0) return;

    try {
      setIsSubmitting(true);
      await onSubmitQuote(content.trim(), post.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <span className="text-xs font-bold flex items-center gap-1.5 text-sky-500">
            <Repeat2 size={16} /> Quote Post
          </span>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={3}
            maxLength={280}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your comment (up to 280 chars)..."
            className="w-full bg-transparent text-xs outline-none resize-none leading-relaxed"
            autoFocus
          />

          {/* Quoted Post Snippet Card */}
          <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{post.authorName}</span>
              <span className="text-[10px] text-neutral-400">@{post.authorUsername}</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3">{post.content}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className={`text-[11px] font-bold ${remaining < 20 ? 'text-red-500' : 'text-neutral-400'}`}>
              {remaining}
            </span>
            <button
              type="submit"
              disabled={!content.trim() || remaining < 0 || isSubmitting}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-full transition"
            >
              {isSubmitting ? 'Posting...' : 'Quote Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
