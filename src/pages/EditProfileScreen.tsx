import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';

export function EditProfileScreen({ currentUser, onUpdate }: { currentUser: User; onUpdate: (u: User) => void }) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [websiteLink, setWebsiteLink] = useState(currentUser.websiteLink || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentUser.coverUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      setError('Name and username are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await (api as any).updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        location: location.trim(),
        websiteLink: websiteLink.trim(),
        avatarUrl,
        coverUrl
      });
      onUpdate(res.user);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-4 max-w-md mx-auto space-y-4 pb-20 select-none">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-sm font-bold">Edit Profile</h2>
        <div />
      </div>

      {error && <p className="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl">{error}</p>}

      <div 
        onClick={() => coverInputRef.current?.click()}
        className="relative h-32 bg-neutral-800 rounded-2xl overflow-hidden cursor-pointer group flex items-center justify-center border border-neutral-700"
      >
        {coverUrl ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover" /> : <span className="text-xs text-neutral-400">Change Cover Photo</span>}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
          <Camera size={18} />
        </div>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setCoverUrl)} />
      </div>

      <div className="flex flex-col items-center -mt-12">
        <div 
          onClick={() => avatarInputRef.current?.click()}
          className="w-24 h-24 rounded-full border-4 border-white dark:border-black overflow-hidden bg-neutral-800 cursor-pointer relative group flex items-center justify-center shadow-xl"
        >
          {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-white">{(displayName || 'U').charAt(0)}</span>}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
            <Camera size={20} />
          </div>
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setAvatarUrl)} />
        <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs text-sky-500 font-semibold mt-2 hover:underline">
          Change Profile Picture
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-3 pt-2">
        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Display Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500" required />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500" required />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Bio</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the world about yourself..." className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500 resize-none" />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500" />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Website Link</label>
          <input type="url" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="https://..." className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-sky-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs hover:bg-sky-600 transition mt-4">
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
