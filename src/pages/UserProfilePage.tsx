import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { UserAvatar } from '../components/common/UserAvatar';
import { UserLink } from '../common/UserLink';
import { RichText } from '../components/common/RichText';
import { FollowButton } from '../components/profile/FollowButton';
import { FollowListModal } from '../components/profile/FollowListModal';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { MapPin, Link as LinkIcon, Calendar, Lock, MessageSquare } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState<'followers' | 'following' | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const currentUserId = localStorage.getItem('z_user_id');
  const isOwner = profile && profile.id === currentUserId;

  const loadData = () => {
    if (!username) return;
    setLoading(true);
    apiRequest(`/api/users/u/${username}`)
      .then((res) => {
        setProfile(res.profile);
        setPosts(res.posts || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [username]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-neutral-500">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-sm font-semibold">User not found.</div>;
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'reels') return p.post_type === 'video';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white dark:bg-black border-x border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white pb-24">
      {/* Cover Banner */}
      <div className="h-40 bg-gradient-to-r from-sky-400 to-indigo-600 relative overflow-hidden">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Header Info */}
      <div className="px-5 pb-4">
        <div className="flex justify-between items-end relative -mt-14 mb-4">
          <UserAvatar
            username={profile.username}
            avatarUrl={profile.avatar_url}
            displayName={profile.display_name}
            size="xl"
            className="border-4 border-white dark:border-black rounded-full"
          />

          <div className="flex gap-2">
            {isOwner ? (
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => (window.location.href = `/messages/${profile.id}`)}
                  className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <MessageSquare size={16} />
                </button>
                <FollowButton
                  targetUserId={profile.id}
                  initialStatus={profile.followStatus}
                  onStatusChange={(newStatus) => {
                    setProfile((prev: any) => ({
                      ...prev,
                      followStatus: newStatus,
                      followers_count:
                        newStatus === 'following' || newStatus === 'friends'
                          ? prev.followers_count + 1
                          : prev.followers_count - 1,
                    }));
                  }}
                />
              </>
            )}
          </div>
        </div>

        <UserLink
          username={profile.username}
          displayName={profile.display_name}
          isVerified={profile.is_verified}
          className="text-xl font-bold"
        />
        <p className="text-xs text-neutral-500 mb-3">@{profile.username}</p>

        {profile.bio && (
          <p className="text-sm mb-3">
            <RichText content={profile.bio} />
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-neutral-500 mb-4">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin size={13} /> <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-500 hover:underline"
            >
              <LinkIcon size={13} /> <span>{profile.website}</span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={13} />{' '}
            <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Counts (Clickable) */}
        <div className="flex gap-5 text-xs pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <button onClick={() => setListModal('following')} className="hover:underline">
            <span className="font-bold text-neutral-900 dark:text-white">{profile.following_count}</span>{' '}
            <span className="text-neutral-500">Following</span>
          </button>
          <button onClick={() => setListModal('followers')} className="hover:underline">
            <span className="font-bold text-neutral-900 dark:text-white">{profile.followers_count}</span>{' '}
            <span className="text-neutral-500">Followers</span>
          </button>
          <div>
            <span className="font-bold text-neutral-900 dark:text-white">{profile.posts_count}</span>{' '}
            <span className="text-neutral-500">Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-center">
        {(['posts', 'reels', 'tagged'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 capitalize transition ${
              activeTab === tab
                ? 'border-b-2 border-sky-500 text-sky-500'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts or Empty State */}
      {profile.is_private && !profile.is_following && !isOwner ? (
        <div className="py-20 text-center text-neutral-500 space-y-2">
          <Lock size={32} className="mx-auto text-neutral-400" />
          <p className="font-semibold text-sm text-neutral-900 dark:text-white">This Account is Private</p>
          <p className="text-xs">Follow this account to view their posts and reels.</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-20 text-center text-neutral-500">
          <p className="text-sm font-semibold mb-1">No {activeTab} yet</p>
          <p className="text-xs">When posts are published, they will show up here.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredPosts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
              <p className="text-sm mb-2">
                <RichText content={post.content} />
              </p>
              {post.media_url && (
                <div className="rounded-2xl overflow-hidden max-h-96 bg-black mb-2">
                  {post.post_type === 'video' ? (
                    <video src={post.media_url} controls className="w-full max-h-96 object-contain" />
                  ) : (
                    <img src={post.media_url} alt="Media" className="w-full object-cover" />
                  )}
                </div>
              )}
              <div className="flex gap-4 text-xs text-neutral-500">
                <span>❤️ {post.likes_count}</span>
                <span>💬 {post.comments_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {listModal && (
        <FollowListModal
          isOpen={true}
          onClose={() => setListModal(null)}
          username={profile.username}
          mode={listModal}
        />
      )}

      {editModalOpen && (
        <EditProfileModal
          isOpen={true}
          onClose={() => setEditModalOpen(false)}
          currentProfile={profile}
          onUpdated={(updatedUser) => {
            setProfile((prev: any) => ({ ...prev, ...updatedUser }));
          }}
        />
      )}
    </div>
  );
};
