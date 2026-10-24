import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Plus, Lock, Globe, TrendingUp, Hash, 
  UserPlus, UserCheck, ArrowLeft, Heart, MessageCircle, X, Sparkles 
} from 'lucide-react';
import type { User, CommunityGroup, TrendingTopic, SearchResults, Post } from '../types';
import { extractHashtags } from '../types';
import { api } from '../services/api';
import { GroupDetailView } from '../components/GroupDetailView';

export function DiscoverScreen({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'trends' | 'communities'>('trends');
  const [query, setQuery] = useState('');
  
  // Search Mode
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'people' | 'posts' | 'tags'>('all');
  const [searchResults, setSearchResults] = useState<SearchResults>({ people: [], posts: [], hashtags: [] });

  // Trending & Suggestions
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<any[]>([]);

  // Active Hashtag Feed Page
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [hashtagPosts, setHashtagPosts] = useState<Post[]>([]);

  // Communities State
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState(false);

  useEffect(() => {
    loadTrending();
    loadSuggestedUsers();
    loadGroups();
  }, []);

  const loadTrending = async () => {
    const t = await api.getTrending();
    setTrending(t);
  };

  const loadSuggestedUsers = async () => {
    const u = await api.getSuggestedUsers();
    setSuggestedPeople(u);
  };

  const loadGroups = async () => {
    const g = await api.getGroups();
    setGroups(g);
  };

  // Live search handler
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length > 0) {
      setIsSearching(true);
      const results = await api.searchDiscover(val.trim());
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults({ people: [], posts: [], hashtags: [] });
    }
  };

  // Open Hashtag Page
  const handleOpenHashtag = async (tag: string) => {
    const clean = tag.replace(/^#/, '');
    setActiveHashtag(clean);
    setIsSearching(false);
    const posts = await api.getPostsByHashtag(clean);
    setHashtagPosts(posts);
  };

  const handleToggleFollow = async (targetUserId: string) => {
    await api.toggleFollow(targetUserId);
    setSuggestedPeople((prev) => prev.filter((p) => p.id !== targetUserId));
    setSearchResults((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === targetUserId ? { ...p, isFollowing: !p.isFollowing } : p))
    }));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const created = await api.createGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      isPrivate: newGroupPrivacy
    });

    setGroups([created, ...groups]);
    setShowCreateGroup(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedGroup(created);
  };

  // 1. Hashtag Detail Page
  if (activeHashtag) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 select-none pb-20">
        <div className="sticky top-14 z-30 flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur">
          <button onClick={() => setActiveHashtag(null)} className="p-1 text-neutral-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold flex items-center gap-1 text-sky-500">
              <Hash size={18} /> {activeHashtag}
            </h2>
            <p className="text-[10px] text-neutral-400">{hashtagPosts.length} posts</p>
          </div>
        </div>

        {hashtagPosts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No posts found for #{activeHashtag} yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {hashtagPosts.map((post) => (
              <article key={post.id} className="p-4 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                    {post.authorAvatar ? <img src={post.authorAvatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{(post.authorName || 'U').charAt(0)}</span>}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{post.authorName}</h4>
                    <p className="text-[10px] text-neutral-400">@{post.authorUsername}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed">{post.content}</p>
                {post.type === 'image' && post.mediaUrl && (
                  <img src={post.mediaUrl} alt="media" className="rounded-xl max-h-80 w-full object-cover" />
                )}
                {post.type === 'video' && post.mediaUrl && (
                  <video src={post.mediaUrl} controls className="rounded-xl max-h-80 w-full bg-black" />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Community Detail Page
  if (selectedGroup) {
    return (
      <GroupDetailView
        group={selectedGroup}
        currentUser={user}
        onBack={() => setSelectedGroup(null)}
        onGroupUpdated={loadGroups}
      />
    );
  }

  return (
    <div className="p-4 space-y-5 select-none pb-20">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-neutral-400" size={16} />
        <input 
          type="text" 
          value={query}
          onChange={handleSearchChange}
          placeholder="Search people, posts, #hashtags..." 
          className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full py-2.5 pl-9 pr-9 text-xs outline-none focus:border-sky-500"
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsSearching(false); }} className="absolute right-3 top-3 text-neutral-400 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* --- SEARCH RESULTS MODE --- */}
      {isSearching ? (
        <div className="space-y-4">
          {/* Search Segment Filter */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
            {(['all', 'people', 'posts', 'tags'] as const).map((seg) => (
              <button
                key={seg}
                onClick={() => setSearchFilter(seg)}
                className={`flex-1 pb-2 capitalize transition ${
                  searchFilter === seg ? 'text-sky-500 border-b-2 border-sky-500 font-bold' : 'text-neutral-500'
                }`}
              >
                {seg}
              </button>
            ))}
          </div>

          {/* People Results */}
          {(searchFilter === 'all' || searchFilter === 'people') && searchResults.people.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase">People</h4>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {searchResults.people.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                        {p.avatarUrl ? <img src={p.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span>{p.displayName.charAt(0)}</span>}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold">{p.displayName}</h5>
                        <p className="text-[10px] text-neutral-400">@{p.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFollow(p.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.isFollowing ? 'border border-neutral-700 text-neutral-400' : 'bg-sky-500 text-white'
                      }`}
                    >
                      {p.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Results */}
          {(searchFilter === 'all' || searchFilter === 'tags') && searchResults.hashtags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase">Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {searchResults.hashtags.map((h) => (
                  <button
                    key={h.tag}
                    onClick={() => handleOpenHashtag(h.tag)}
                    className="flex items-center gap-1.5 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs hover:border-sky-500"
                  >
                    <span className="font-bold text-sky-500">#{h.tag}</span>
                    <span className="text-[10px] text-neutral-400">({h.postCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {(searchFilter === 'all' || searchFilter === 'posts') && searchResults.posts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase">Posts</h4>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {searchResults.posts.map((p) => (
                  <div key={p.id} className="py-2.5 text-xs space-y-1">
                    <span className="font-bold text-neutral-300">@{p.authorUsername}</span>
                    <p className="text-neutral-400 line-clamp-2">{p.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.people.length === 0 && searchResults.posts.length === 0 && searchResults.hashtags.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      ) : (
        /* --- MAIN DISCOVER VIEW (TRENDS & COMMUNITIES TABS) --- */
        <div className="space-y-5">
          {/* Main Tabs */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex-1 pb-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'trends' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
              }`}
            >
              <TrendingUp size={14} /> Explore & Trends
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`flex-1 pb-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'communities' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
              }`}
            >
              <Users size={14} /> Communities ({groups.length})
            </button>
          </div>

          {activeTab === 'trends' ? (
            <div className="space-y-6">
              {/* 1. Suggested People to Follow (Horizontal Scroll) */}
              {suggestedPeople.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Suggested People</h4>
                  <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                    {suggestedPeople.map((p) => (
                      <div
                        key={p.id}
                        className="w-36 shrink-0 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex flex-col items-center text-center space-y-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs">
                          {p.avatarUrl ? <img src={p.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span>{p.displayName.charAt(0)}</span>}
                        </div>
                        <div className="min-w-0 w-full">
                          <h5 className="text-xs font-bold truncate">{p.displayName}</h5>
                          <p className="text-[10px] text-neutral-400 truncate">@{p.username}</p>
                        </div>
                        <button
                          onClick={() => handleToggleFollow(p.id)}
                          className="w-full bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold py-1 rounded-full transition"
                        >
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. "Trending Now" (Last 24 Hours Ranked List) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles size={13} className="text-sky-400" /> Trending Now (24h)
                  </h4>
                  <span className="text-[10px] text-neutral-500">Live Counter</span>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
                  {trending.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No trending topics in the last 24 hours. Post with #tags to start trends!
                    </div>
                  ) : (
                    trending.map((t, index) => (
                      <div
                        key={t.tag}
                        onClick={() => handleOpenHashtag(t.tag)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-neutral-500 w-4 text-center">
                            {index + 1}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-sky-500 hover:underline">#{t.tag}</h5>
                            <span className="text-[10px] text-neutral-400">{t.count} {t.count === 1 ? 'post' : 'posts'} in 24h</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-400">Trending</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- COMMUNITIES VIEW --- */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Communities & Groups</h3>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="flex items-center gap-1 bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sky-600 transition"
                >
                  <Plus size={14} /> Create Group
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  <Users size={36} className="mx-auto mb-2 text-neutral-600 stroke-1" />
                  <p className="font-semibold text-neutral-300">No communities yet</p>
                  <p className="mt-1">Tap "+ Create Group" to start the first community!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-sky-500 transition cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-sky-400">
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold flex items-center gap-1.5">
                              {g.name}
                              {g.isPrivate ? <Lock size={12} className="text-neutral-400" /> : <Globe size={12} className="text-neutral-400" />}
                            </h4>
                            <span className="text-[10px] text-neutral-400">{g.memberCount} members</span>
                          </div>
                        </div>

                        {g.isMember && (
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                            {g.myRole === 'admin' ? 'Admin' : 'Joined'}
                          </span>
                        )}
                      </div>
                      {g.description && <p className="text-xs text-neutral-400 line-clamp-2">{g.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateGroup} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Create Community Group</h3>
            <input
              type="text"
              placeholder="Group Name (e.g. Kali Hackers & Devs)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs outline-none"
              required
            />
            <textarea
              rows={2}
              placeholder="What is this community about?"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs outline-none resize-none"
            />
            <div className="flex items-center justify-between p-2.5 bg-neutral-800/40 rounded-xl text-xs">
              <div>
                <span className="font-bold block">Private Group</span>
                <span className="text-[10px] text-neutral-400">Only members can view group feed</span>
              </div>
              <input
                type="checkbox"
                checked={newGroupPrivacy}
                onChange={(e) => setNewGroupPrivacy(e.target.checked)}
                className="w-4 h-4 accent-sky-500 cursor-pointer"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateGroup(false)} className="flex-1 py-2 rounded-lg border border-neutral-700 text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
