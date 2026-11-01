import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Video, Bookmark, UserCheck, UserPlus, MessageSquare, MapPin, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import type { User, Post } from '../types';
import { api } from '../services/api';

export function UserProfileScreen({ currentUser }: { currentUser: User }) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'reels' | 'tagged'>('posts');

  useEffect(() => {
    if (username) {
      api.getUserProfile(username).then(data => {
        setProfileUser(data);
        setPosts(data.posts || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [username]);

  if (loading) return <div className="p-10 text-center text-xs">Loading...</div>;
  if (!profileUser) return <div className="p-10 text-center text-xs">User not found</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 pb-20">
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
        <h2 className="font-bold">{profileUser.displayName}</h2>
      </div>
      
      <div className="h-32 bg-neutral-800" />
      <div className="px-4">
        <div className="w-20 h-20 rounded-full border-4 border-black -mt-10 bg-neutral-700 overflow-hidden">
          {profileUser.avatarUrl && <img src={profileUser.avatarUrl} className="w-full h-full" />}
        </div>
        <h2 className="text-lg font-bold mt-2">{profileUser.displayName}</h2>
        <p className="text-xs text-neutral-500">@{profileUser.username}</p>
        <p className="text-xs my-2">{profileUser.bio}</p>
        <div className="flex gap-4 text-xs font-bold py-2">
          <span>{profileUser.followersCount} Followers</span>
          <span>{profileUser.followingCount} Following</span>
        </div>
      </div>
    </div>
  );
}
