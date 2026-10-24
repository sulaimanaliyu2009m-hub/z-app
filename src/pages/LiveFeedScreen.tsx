import React, { useState, useEffect, useRef } from 'react';
import { 
  Repeat2, Heart, MessageCircle, Share2, Sparkles, Send, 
  ArrowUp, TrendingUp, Users, Hash 
} from 'lucide-react';
import type { Post, User, TrendingTopic } from '../types';
import { extractHashtags } from '../types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { QuoteModal } from '../components/QuoteModal';

export function LiveFeedScreen({
  currentUser,
  onOpenComments,
  onOpenShare
}: {
  currentUser: User;
  onOpenComments: (p: Post) => void;
  onOpenShare: (p: Post) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [composerText, setComposerText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Quote Modal State
  const [activeQuoteTarget, setActiveQuoteTarget] = useState<Post | null>(null);

  // Large-screen sidebar data
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);

  const socket = getSocket();
  const topRef = useRef<HTMLDivElement>(null);
  const remaining = 280 - composerText.length;

  useEffect(() => {
    loadLivePosts();
    loadSidebarData();
  }, []);

  const loadLivePosts = async () => {
    const data = await api.getLivePosts();
    setPosts(data);
  };

  const loadSidebarData = async () => {
    const [t, s] = await Promise.all([api.getTrending(), api.getSuggestedUsers()]);
    setTrends(t.slice(0, 5));
    setSuggested(s.slice(0, 4));
  };

  // Real-time WebSocket streaming from Redis Streams
  useEffect(() => {
    if (!socket) return;

    socket.on('live_stream_new_post', (newPost: Post) => {
      if (newPost.userId === currentUser.id) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        setPendingPosts((prev) => [newPost, ...prev]);
      }
    });

    return () => {
      socket.off('live_stream_new_post');
    };
  }, [socket, currentUser.id]);

  // Click floating "New posts" button
  const handleRevealPendingPosts = () => {
    setPosts((prev) => [...pendingPosts, ...prev]);
    setPendingPosts([]);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || remaining < 0) return;

    try {
      setIsPosting(true);
      await api.createLivePost(composerText.trim());
      setComposerText('');
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    setPosts((prev) => prev.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
        };
      }
      return p;
    }));
    await api.toggleLike(postId);
  };

  const handleToggleRepost = async (postId: string) => {
    setPosts((prev) => prev.map((p) => {
      if (p.id === postId) {
        const isReposted = !p.isReposted;
        return {
          ...p,
          isReposted,
          repostsCount: (p.repostsCount || 0) + (isReposted ? 1 : -1)
        };
      }
      return p;
    }));
    await api.toggleRepost(postId);
  };

  const handleSubmitQuote = async (content: string, quoteOfId: string) => {
    await api.createLivePost(content, quoteOfId);
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 select-none pb-20">
      
      {/* Center Feed Column */}
      <div className="w-full max-w-md border-x border-neutral-200 dark:border-neutral-800 flex flex-col relative">
        <div ref={topRef} />

        {/* Floating "New Posts" Button */}
        {pendingPosts.length > 0 && (
          <button
            onClick={handleRevealPendingPosts}
            className="sticky top-16 z-30 mx-auto mt-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 animate-bounce transition"
          >
            <ArrowUp size={14} />
            Show {pendingPosts.length} new {pendingPosts.length === 1 ? 'post' : 'posts'}
          </button>
        )}

        {/* 280-Character Live Composer */}
        <form onSubmit={handlePublish} className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center font-bold text-xs">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(currentUser.displayName || 'U').charAt(0)}</span>
              )}
            </div>
            <textarea
              rows={3}
              maxLength={280}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="What is happening?! (up to 280 chars)"
              className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900">
            <span className={`text-[11px] font-bold ${remaining < 20 ? 'text-red-500' : 'text-neutral-400'}`}>
              {remaining}
            </span>

            <button
              type="submit"
              disabled={!composerText.trim() || remaining < 0 || isPosting}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-full transition"
            >
              {isPosting ? 'Posting...' : 'Live Post'}
            </button>
          </div>
        </form>

        {/* Live Stream List */}
        {posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-300">Live stream is quiet</p>
            <p>Post something above to start the real-time stream!</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {posts.map((post) => {
              const hashtags = extractHashtags(post.content);

              return (
                <article key={post.id} className="p-4 space-y-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 transition">
                  {/* Author Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(post.authorName || 'U').charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{post.authorName}</h4>
                      <p className="text-[10px] text-neutral-400">
                        @{post.authorUsername} · {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* 280-char Text Content */}
                  <p className="text-xs leading-relaxed break-words">{post.content}</p>

                  {/* Hashtags */}
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hashtags.map((tag) => (
                        <span key={tag} className="text-[11px] text-sky-500 font-medium">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Quoted Post Embedded Card Preview */}
                  {post.quotedPost && (
                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-1 my-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{post.quotedPost.authorName}</span>
                        <span className="text-[10px] text-neutral-400">@{post.quotedPost.authorUsername}</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3">{post.quotedPost.content}</p>
                    </div>
                  )}

                  {/* Action Bar (Comment, Repost / Quote, Like, Share) */}
                  <div className="flex items-center justify-between pt-2 text-neutral-500 text-xs max-w-xs">
                    {/* Reply */}
                    <button onClick={() => onOpenComments(post)} className="flex items-center gap-1.5 hover:text-sky-500 transition">
                      <MessageCircle size={15} />
                      <span>{(post.comments || []).length}</span>
                    </button>

                    {/* Repost / Quote Toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRepost(post.id)}
                        className={`flex items-center gap-1 transition ${post.isReposted ? 'text-green-500 font-bold' : 'hover:text-green-500'}`}
                        title="Repost"
                      >
                        <Repeat2 size={16} />
                        <span>{post.repostsCount || 0}</span>
                      </button>

                      <button
                        onClick={() => setActiveQuoteTarget(post)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-700 hover:border-sky-500 text-neutral-400 hover:text-sky-400"
                        title="Quote Post"
                      >
                        Quote
                      </button>
                    </div>

                    {/* Like */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition ${post.isLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
                    >
                      <Heart size={15} fill={post.isLiked ? 'currentColor' : 'none'} />
                      <span>{post.likesCount || 0}</span>
                    </button>

                    {/* Share */}
                    <button onClick={() => onOpenShare(post)} className="hover:text-sky-500 transition">
                      <Share2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* --- TRENDING TOPICS SIDEBAR (Visible on Desktop / Large Screens: lg:flex) --- */}
      <aside className="hidden lg:flex flex-col w-72 p-4 space-y-5 ml-6 sticky top-14 h-[calc(100vh-60px)] overflow-y-auto no-scrollbar">
        {/* Trends For You */}
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
          <h3 className="text-sm font-black flex items-center gap-1.5">
            <TrendingUp size={16} className="text-sky-400" /> What's happening
          </h3>
          <div className="space-y-3 divide-y divide-neutral-200 dark:divide-neutral-800">
            {trends.length === 0 ? (
              <p className="text-xs text-neutral-500 pt-2">No active trends yet.</p>
            ) : (
              trends.map((t) => (
                <div key={t.tag} className="pt-2">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Trending in Tech</span>
                  <h5 className="text-xs font-bold text-sky-500">#{t.tag}</h5>
                  <span className="text-[10px] text-neutral-500">{t.count} posts in 24h</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Who to Follow */}
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
          <h3 className="text-sm font-black flex items-center gap-1.5">
            <Users size={16} className="text-sky-400" /> Who to follow
          </h3>
          <div className="space-y-2.5">
            {suggested.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center font-bold text-[10px]">
                    {s.avatarUrl ? <img src={s.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span>{s.displayName.charAt(0)}</span>}
                  </div>
                  <div className="truncate">
                    <p className="font-bold truncate">{s.displayName}</p>
                    <p className="text-[10px] text-neutral-400 truncate">@{s.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => api.toggleFollow(s.id).then(loadSidebarData)}
                  className="bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] font-bold px-3 py-1 rounded-full hover:opacity-90 transition shrink-0"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Quote Post Modal */}
      {activeQuoteTarget && (
        <QuoteModal
          post={activeQuoteTarget}
          onClose={() => setActiveQuoteTarget(null)}
          onSubmitQuote={handleSubmitQuote}
        />
      )}

    </div>
  );
}
