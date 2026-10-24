import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Inbox, UserCheck, UserPlus, Sparkles, Loader2 } from 'lucide-react';
import type { Post, User, UserStoriesGroup, Story, AiSummaryResponse } from '../types';
import { extractHashtags } from '../types';
import { api } from '../services/api';
import { StoryRow } from '../components/StoryRow';
import { StoryViewer } from '../components/StoryViewer';
import { CreateStoryModal } from '../components/CreateStoryModal';

export function FlowFeed({ 
  posts = [], 
  currentUser,
  isFollowingTab,
  onToggleLike, 
  onToggleFollow,
  onOpenComments,
  onOpenShare
}: {
  posts: Post[];
  currentUser: User;
  isFollowingTab: boolean;
  onToggleLike: (id: string) => void;
  onToggleFollow: (id: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenShare: (post: Post) => void;
}) {
  const [storyGroups, setStoryGroups] = useState<UserStoriesGroup[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Gemini Summaries State (keyed by postId)
  const [summaries, setSummaries] = useState<{ [postId: string]: AiSummaryResponse }>({});
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);

  const loadStories = async () => {
    try {
      const groups = await api.getStories();
      setStoryGroups(groups);
    } catch {}
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleSummarize = async (post: Post) => {
    if (summaries[post.id]) {
      // Toggle off if already showing
      setSummaries(prev => {
        const next = { ...prev };
        delete next[post.id];
        return next;
      });
      return;
    }

    try {
      setLoadingSummary(post.id);
      const commentsText = (post.comments || []).map(c => `${c.username}: ${c.text}`);
      const data = await api.summarizePost(post.content, commentsText);
      setSummaries(prev => ({ ...prev, [post.id]: data }));
    } catch (err: any) {
      alert(err.message || 'Could not generate summary');
    } finally {
      setLoadingSummary(null);
    }
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const followingIds = Array.isArray(currentUser?.followingIds) ? currentUser.followingIds : [];
  const displayPosts = isFollowingTab ? safePosts.filter((p: any) => followingIds.includes(p.userId)) : safePosts;

  return (
    <div>
      {/* 1. Stories Row */}
      {!isFollowingTab && (
        <StoryRow
          currentUser={currentUser}
          storyGroups={storyGroups}
          onOpenViewer={(idx) => setViewerIndex(idx)}
          onOpenCreate={() => setShowCreateStory(true)}
        />
      )}

      {/* 2. Story Viewer Modal */}
      {viewerIndex !== null && (
        <StoryViewer
          groups={storyGroups}
          initialGroupIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      {/* 3. Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={() => loadStories()}
        />
      )}

      {/* 4. Feed Stream */}
      {displayPosts.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center p-6 text-neutral-500">
          <Inbox size={40} className="mb-2 stroke-1" />
          <p className="text-sm font-semibold">{isFollowingTab ? 'No posts from people you follow' : 'Feed is empty'}</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            {isFollowingTab ? 'Follow creators to see their posts here!' : 'Tap Create (+) to post text, photos, or videos!'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {displayPosts.map((post: any) => {
            const isFollowing = followingIds.includes(post.userId);
            const isSelf = post.userId === currentUser?.id;
            const hashtags = extractHashtags(post.content);
            const summary = summaries[post.id];

            return (
              <article key={post.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden font-bold text-xs">
                      {post.authorAvatar ? <img src={post.authorAvatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{(post.authorName || 'U').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{post.authorName}</h4>
                      <p className="text-[10px] text-neutral-400">@{post.authorUsername} · {new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Gemini Summarize Button */}
                    <button
                      onClick={() => handleSummarize(post)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-sky-500 hover:text-sky-400 px-2.5 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 transition"
                      title="Summarize with Gemini"
                    >
                      {loadingSummary === post.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      <span>{summary ? 'Hide AI' : 'Summarize'}</span>
                    </button>

                    {!isSelf && (
                      <button
                        onClick={() => onToggleFollow(post.userId)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          isFollowing ? 'border border-neutral-700 text-neutral-400' : 'bg-sky-500 text-white'
                        }`}
                      >
                        {isFollowing ? <><UserCheck size={12}/> Following</> : <><UserPlus size={12}/> Follow</>}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs leading-relaxed">{post.content}</p>

                {/* Gemini AI Summary Card */}
                {summary && (
                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1 text-sky-400 font-bold text-[11px]">
                      <Sparkles size={13} />
                      <span>Gemini Summary</span>
                    </div>
                    <p className="text-neutral-200 leading-relaxed font-medium">{summary.summary}</p>
                    {summary.keyTakeaways?.length > 0 && (
                      <ul className="list-disc pl-4 space-y-0.5 text-neutral-400 text-[11px] pt-1">
                        {summary.keyTakeaways.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map((tag) => <span key={tag} className="text-[11px] text-sky-500 font-medium">#{tag}</span>)}
                  </div>
                )}

                {post.type === 'image' && post.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900">
                    <img src={post.mediaUrl} alt="uploaded post" className="w-full max-h-96 object-cover" />
                  </div>
                )}

                {post.type === 'video' && post.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black">
                    <video src={post.mediaUrl} poster={post.thumbnailUrl} controls className="w-full max-h-96" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-neutral-500 text-xs max-w-xs">
                  <button onClick={() => onToggleLike(post.id)} className={`flex items-center gap-1.5 ${post.isLiked ? 'text-red-500 font-bold' : ''}`}>
                    <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likesCount || 0}</span>
                  </button>
                  <button onClick={() => onOpenComments(post)} className="flex items-center gap-1.5 hover:text-sky-500">
                    <MessageCircle size={16} />
                    <span>{(post.comments || []).length}</span>
                  </button>
                  <button onClick={() => onOpenShare(post)} className="flex items-center gap-1.5 hover:text-green-500">
                    <Share2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
