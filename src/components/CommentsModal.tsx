import React, { useState, useRef } from 'react';
import { X, Send, CornerDownRight } from 'lucide-react';
import type { Post } from '../types';

export function CommentsModal({
  post,
  onClose,
  onAddComment
}: {
  post: Post;
  onClose: () => void;
  onAddComment: (postId: string, text: string, parentId?: string) => void;
}) {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const comments = Array.isArray(post.comments) ? post.comments : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(post.id, text.trim(), replyingTo?.id);
    setText('');
    setReplyingTo(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl max-h-[70vh] flex flex-col w-full max-w-md mx-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Comments</span>
            <span className="text-xs text-neutral-400">({comments.length})</span>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">No comments yet. Start the conversation!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sky-500">@{comment.username}</span>
                    <span className="text-[10px] text-neutral-400 ml-2">{comment.createdAt}</span>
                    <p className="text-neutral-800 dark:text-neutral-200 mt-0.5">{comment.text}</p>
                  </div>
                  <button onClick={() => { setReplyingTo({ id: comment.id, username: comment.username }); inputRef.current?.focus(); }} className="text-[11px] text-neutral-400 hover:text-sky-500 font-semibold">
                    Reply
                  </button>
                </div>
                {Array.isArray(comment.replies) && comment.replies.map((reply) => (
                  <div key={reply.id} className="pl-4 ml-2 border-l border-neutral-200 dark:border-neutral-800 text-xs">
                    <div className="flex items-center gap-1">
                      <CornerDownRight size={12} className="text-neutral-500" />
                      <span className="font-bold text-sky-400">@{reply.username}</span>
                      <span className="text-[10px] text-neutral-400 ml-1">{reply.createdAt}</span>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 pl-4">{reply.text}</p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          {replyingTo && (
            <div className="flex items-center justify-between text-[11px] text-sky-500 bg-sky-500/10 px-3 py-1 rounded-lg mb-2">
              <span>Replying to @{replyingTo.username}</span>
              <button type="button" onClick={() => setReplyingTo(null)}><X size={12} /></button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-xs outline-none"
            />
            <button type="submit" disabled={!text.trim()} className="bg-sky-500 text-white p-2 rounded-full disabled:opacity-40">
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
