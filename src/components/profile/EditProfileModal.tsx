import React, { useState, useRef } from 'react';
import { apiRequest } from '../../services/api';
import { Camera, X, Check } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: any;
  onUpdated: (updatedUser: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdated,
}) => {
  const [displayName, setDisplayName] = useState(currentProfile?.display_name || '');
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [location, setLocation] = useState(currentProfile?.location || '');
  const [website, setWebsite] = useState(currentProfile?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState(currentProfile?.cover_url || '');
  const [isPrivate, setIsPrivate] = useState(currentProfile?.is_private || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    setError('');
    try {
      // 1. Request presigned upload URL from server
      const { uploadUrl, publicUrl } = await apiRequest('/api/videos/request-upload-url', {
        method: 'POST',
        body: JSON.stringify({
          contentType: file.type || 'image/jpeg',
          sizeBytes: file.size,
        }),
      });

      // 2. Direct upload to Cloudflare R2
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });

      if (type === 'avatar') setAvatarUrl(publicUrl);
      if (type === 'cover') setCoverUrl(publicUrl);
    } catch {
      setError(`Failed to upload ${type}. Check your connection.`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          displayName,
          username,
          bio,
          location,
          website,
          avatarUrl,
          coverUrl,
          isPrivate,
        }),
      });

      onUpdated(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <form onSubmit={handleSave}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Edit Profile</h3>
            <button type="button" onClick={onClose} className="text-neutral-500 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {error && <p className="p-3 bg-red-500/10 text-red-500 text-xs m-4 rounded-xl">{error}</p>}

          <div className="relative h-28 bg-neutral-200 dark:bg-neutral-800">
            {coverUrl && <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute inset-0 bg-black/30 hover:bg-black/40 flex items-center justify-center text-white gap-1 text-xs transition"
            >
              <Camera size={16} /> <span>Change Cover</span>
            </button>
            <input
              type="file"
              ref={coverInputRef}
              hidden
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
            />
          </div>

          <div className="px-6 relative -mt-10 mb-4 flex items-end justify-between">
            <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-neutral-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                  {displayName?.[0] || 'Z'}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 hover:bg-black/50 flex items-center justify-center text-white transition"
              >
                <Camera size={18} />
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                hidden
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')}
              />
            </div>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-[11px] text-red-500 hover:underline"
              >
                Remove Photo
              </button>
            )}
          </div>

          <div className="px-6 space-y-3 max-h-[300px] overflow-y-auto">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl text-xs outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl text-xs outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl text-xs outline-none focus:border-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-neutral-400">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-400">Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <span className="text-neutral-700 dark:text-neutral-300">Private Account</span>
            </label>
          </div>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs bg-neutral-200 dark:bg-neutral-800 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center gap-1"
            >
              <Check size={14} /> <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
