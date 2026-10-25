import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';
import { UserLink } from '../common/UserLink';
import { FollowButton } from './FollowButton';
import { Search, X } from 'lucide-react';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  mode: 'followers' | 'following';
}

export const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, username, mode }) => {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    apiRequest(`/api/users/${username}/${mode}?q=${encodeURIComponent(query)}`)
      .then((data) => setItems(data[mode] || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isOpen, username, mode, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md h-[550px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold capitalize text-neutral-900 dark:text-white">{mode}</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl text-xs">
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              placeholder={`Search ${mode}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/50 p-2">
          {loading ? (
            <p className="p-6 text-center text-xs text-neutral-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-xs text-neutral-500">No {mode} found.</p>
          ) : (
            items.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded-xl transition">
                <div className="flex items-center gap-2.5">
                  <UserAvatar username={user.username} avatarUrl={user.avatar_url} size="sm" />
                  <div>
                    <UserLink username={user.username} displayName={user.display_name} isVerified={user.is_verified} />
                    <p className="text-[11px] text-neutral-500">@{user.username}</p>
                    {user.mutual_sample?.length > 0 && (
                      <p className="text-[10px] text-sky-500 font-medium">
                        Followed by {user.mutual_sample.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <FollowButton
                  targetUserId={user.id}
                  initialStatus={user.is_following ? 'following' : user.follows_you ? 'follow_back' : 'none'}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
