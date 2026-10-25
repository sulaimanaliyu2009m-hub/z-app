import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Video, Bookmark, UserCheck, UserPlus, MessageSquare, MapPin, Link as LinkIcon, CheckCircle2, X } from 'lucide-react';
import type { User, Post } from '../types';
import { api } from '../services/api';

export function UserProfileScreen({ currentUser }: { currentUser: User }) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'reels' | 'tagged'>('posts');

  const [showListModal, setShowListModal] = useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = useState<any[]>([]);

  const isSelf = profileUser?.id === currentUser.id;

  useEffect(() => {
    if (username) {
      loadProfileData(username);
    }
  }, [username]);

  const loadProfileData = async (handle: string) => {
    try {
      setLoading(true);
      const data = await (api as any).getUserProfile(handle);
      setProfileUser(data);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    const isCurrentlyFollowing = profileUser.connectionState === 'following' || profileUser.connectionState === 'friends';
    
    setProfileUser(prev => prev ? {
      ...prev,
      connectionState: isCurrentlyFollowing ? 'none' : 'following',
      followersCount: isCurrentlyFollowing ? prev.followersCount - 1 : prev.followersCount + 1
    } : null);

    await api.toggleFollow(profileUser.id);
  };

  const openFollowList = async (type: 'followers' | 'following') => {
    if (!profileUser) return;
    setShowListModal(type);
    const data = type === 'followers' ? await (api as any).getFollowers(profileUser.id) : await (api as any).getFollowing(profileUser.id);
    setListUsers(data);
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-xs text-neutral-400">Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <p className="text-sm font-bold">User not found</p>
        <button onClick={() => navigate(-1)} className="text-xs text-sky-500 font-semibold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 pb-20 select-none">
      <div className="sticky top-14 z-20 flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
        <button onClick={() => navigate(-1)} className="p-1 text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="text-xs font-bold flex items-center gap-1">
            {profileUser.displayName}
            {profileUser.isVerified && <CheckCircle2 size={14} className="text-sky-500 fill-sky-500 text-white" />}
          </h3>
          <span className="text-[10px] text-neutral-400">{posts.length} posts</span>
        </div>
      </div>

      <div className="relative h-36 bg-neutral-800">
        {profileUser.coverUrl ? (
          <img src={profileUser.coverUrl} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-sky-900 via-neutral-900 to-purple-900" />
        )}
      </div>

      <div className="px-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 relative">
        <div className="flex justify-between items-end -mt-10 mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-black overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-xl text-white">
            {profileUser.avatarUrl ? (
              <img src={profileUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{(profileUser.displayName || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex gap-2">
            {isSelf ? (
              <button onClick={() => navigate('/profile/edit')} className="border border-neutral-700 px-4 py-1.5 rounded-full text-xs font-semibold hover:border-sky-500 transition">
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                    profileUser.connectionState === 'following' || profileUser.connectionState === 'friends'
                      ? 'border border-neutral-700 text-neutral-300'
                      : 'bg-sky-500 text-white hover:bg-sky-600'
                  }`}
                >
                  {profileUser.connectionState === 'friends' ? <><UserCheck size={14}/> Friends</> :
                   profileUser.connectionState === 'following' ? <><UserCheck size={14}/> Following</> :
                   profileUser.connectionState === 'follow_back' ? <><UserPlus size={14}/> Follow Back</> :
                   <><UserPlus size={14}/> Follow</>}
                </button>
                <button onClick={() => navigate('/messages')} className="p-2 border border-neutral-700 rounded-full hover:border-sky-500">
                  <MessageSquare size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold flex items-center gap-1.5">
            {profileUser.displayName}
            {profileUser.isVerified && <CheckCircle2 size={15} className="text-sky-500 fill-sky-500 text-white" />}
          </h2>
          <p className="text-xs text-neutral-400">@{profileUser.username}</p>
          {profileUser.bio && <p className="text-xs mt-2 leading-relaxed">{profileUser.bio}</p>}

          <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-neutral-400">
            {profileUser.location && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {profileUser.location}</span>
            )}
            {profileUser.websiteLink && (
              <a href={profileUser.websiteLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-500 hover:underline">
                <LinkIcon size={12} /> {profileUser.websiteLink.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>

        <div className="flex justify-around border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-4 text-xs text-center">
          <div><span className="font-bold block text-sm">{posts.length}</span>Posts</div>
          <div onClick={() => openFollowList('followers')} className="cursor-pointer">
            <span className="font-bold block text-sm">{profileUser.followersCount}</span>Followers
          </div>
          <div onClick={() => openFollowList('following')} className="cursor-pointer">
            <span className="font-bold block text-sm">{profileUser.followingCount}</span>Following
          </div>
        </div>
      </div>

      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button onClick={() => setTab('posts')} className={`flex-1 py-3 flex justify-center border-b-2 ${tab === 'posts' ? 'border-sky-500 text-sky-500' : 'border-transparent text-neutral-500'}`}>
          <Grid size={18} />
        </button>
        <button onClick={() => setTab('reels')} className={`flex-1 py-3 flex justify-center border-b-2 ${tab === 'reels' ? 'border-sky-500 text-sky-500' : 'border-transparent text-neutral-500'}`}>
          <Video size={18} />
        </button>
        <button onClick={() => setTab('tagged')} className={`flex-1 py-3 flex justify-center border-b-2 ${tab === 'tagged' ? 'border-sky-500 text-sky-500' : 'border-transparent text-neutral-500'}`}>
          <Bookmark size={18} />
        </button>
      </div>

      {tab === 'posts' ? (
        posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((p) => (
              <div key={p.id} className="aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden relative">
                {p.type === 'image' && p.mediaUrl ? (
                  <img src={p.mediaUrl} alt="post" className="w-full h-full object-cover" />
                ) : p.type === 'video' && (p.thumbnailUrl || p.mediaUrl) ? (
                  <img src={p.thumbnailUrl || p.mediaUrl} alt="reel" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-2 text-[10px] text-neutral-400 line-clamp-3">{p.content}</div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center text-xs text-neutral-500">No {tab} yet.</div>
      )}

      {showListModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-sm font-bold capitalize">{showListModal}</h3>
              <button onClick={() => setShowListModal(null)}><X size={18} /></button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-800">
              {listUsers.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-500">No users found.</p>
              ) : (
                listUsers.map((u) => (
                  <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div onClick={() => { setShowListModal(null); navigate(`/u/${u.username}`); }} className="flex items-center gap-2.5 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-[10px]">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span>{u.displayName.charAt(0)}</span>}
                      </div>
                      <div>
                        <h5 className="font-bold">{u.displayName}</h5>
                        <span className="text-[10px] text-neutral-400">@{u.username}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
